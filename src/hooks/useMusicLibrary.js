/**
 * Custom hook for managing music library:
 * - Import files with metadata parsing
 * - Persist to IndexedDB
 * - Handle audio playback
 * - Manage library state
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { parseBlob } from 'music-metadata-browser';
import {
  saveTrack,
  getAllTracks,
  deleteTrack,
  searchTracks,
  getAlbums,
  getArtists,
  getLibraryStats,
} from '../lib/musicDb';
import {
  splitArtistNames,
  extractCoverArt,
  generateTrackId,
  createObjectUrl,
  revokeObjectUrl,
  formatDuration,
  DEFAULT_PALETTE,
} from '../lib/metadataUtils';

export function useMusicLibrary() {
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  
  // Playback state
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const playlistRef = useRef([]); // Track order for next/prev

  /**
   * Load library from IndexedDB on mount
   */
  const loadLibrary = useCallback(async () => {
    try {
      setIsLoading(true);
      const [loadedTracks, loadedAlbums, loadedArtists, loadedStats] =
        await Promise.all([
          getAllTracks(),
          getAlbums(),
          getArtists(),
          getLibraryStats(),
        ]);

      setTracks(loadedTracks || []);
      setAlbums(loadedAlbums || []);
      setArtists(loadedArtists || []);
      setStats(loadedStats || null);
      playlistRef.current = loadedTracks || [];
      setError(null);
    } catch (err) {
      console.error('Failed to load library:', err);
      setError('Failed to load music library');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Import audio files with metadata parsing
   */
  const importFiles = useCallback(async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const importedTracks = [];

    setImportProgress({ current: 0, total: files.length });
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Parse metadata using music-metadata-browser
        const meta = await parseBlob(file, { duration: true });
        const tags = meta.common || {};

        const title = tags.title || file.name.replace(/\.[^/.]+$/, '');
        const albumName = tags.album || 'Unknown Album';
        const artistRaw =
          tags.artist ||
          (Array.isArray(tags.artists) ? tags.artists.join(', ') : '');
        const artistNames = splitArtistNames(
          artistRaw.length ? artistRaw : 'Unknown Artist'
        );
        const duration = Math.round(meta.format?.duration || 0);

        // Extract cover art
        let artworkBlob = null;
        if (tags.picture) {
          artworkBlob = extractCoverArt(tags.picture);
        }

        const trackId = generateTrackId();
        const entry = {
          id: trackId,
          title,
          artistNames,
          albumName,
          duration,
          fileName: file.name,
          fileBlob: file,
          artworkBlob,
          importedAt: Date.now(),
        };

        await saveTrack(entry);
        importedTracks.push(entry);
        setImportProgress({ current: i + 1, total: files.length });
      } catch (err) {
        console.error(`Failed to import ${file.name}:`, err);
        
        // Fallback: save with minimal metadata
        try {
          const trackId = generateTrackId();
          const entry = {
            id: trackId,
            title: file.name.replace(/\.[^/.]+$/, ''),
            artistNames: ['Unknown Artist'],
            albumName: 'Imported Files',
            duration: 0,
            fileName: file.name,
            fileBlob: file,
            artworkBlob: null,
            importedAt: Date.now(),
          };
          await saveTrack(entry);
          importedTracks.push(entry);
          setImportProgress({ current: i + 1, total: files.length });
        } catch (fallbackErr) {
          console.error(`Fallback import failed for ${file.name}:`, fallbackErr);
        }
      }
    }

    // Reload library after import
    if (importedTracks.length > 0) {
      await loadLibrary();
    }

    setImportProgress({ current: 0, total: 0 });
    return importedTracks.length;
  }, [loadLibrary]);

  /**
   * Play a track
   */
  const playTrack = useCallback(
    (track) => {
      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          revokeObjectUrl(audioRef.current.src);
        }
      }

      // Create object URL from blob
      const url = createObjectUrl(track.fileBlob);
      if (!url) {
        setError('Failed to play track');
        return;
      }

      // Create audio element
      const audio = new Audio(url);
      audioRef.current = audio;

      // Event listeners
      audio.addEventListener('timeupdate', () => {
        setProgress(Math.floor(audio.currentTime));
      });

      audio.addEventListener('ended', () => {
        playNext();
      });

      audio.addEventListener('error', () => {
        setError('Playback error');
        setIsPlaying(false);
      });

      // Update state
      setNowPlaying({
        trackId: track.id,
        track,
        url,
        artwork: track.artworkBlob ? createObjectUrl(track.artworkBlob) : null,
      });

      setProgress(0);
      setIsPlaying(true);

      // Play
      audio.play().catch((err) => {
        console.warn('Autoplay prevented:', err);
        setIsPlaying(false);
      });
    },
    []
  );

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !nowPlaying) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [nowPlaying]);

  /**
   * Play next track
   */
  const playNext = useCallback(() => {
    if (!nowPlaying || playlistRef.current.length === 0) return;

    const currentIndex = playlistRef.current.findIndex(
      (t) => t.id === nowPlaying.trackId
    );
    const nextIndex = (currentIndex + 1) % playlistRef.current.length;
    playTrack(playlistRef.current[nextIndex]);
  }, [nowPlaying, playTrack]);

  /**
   * Play previous track
   */
  const playPrevious = useCallback(() => {
    if (!nowPlaying || playlistRef.current.length === 0) return;

    const currentIndex = playlistRef.current.findIndex(
      (t) => t.id === nowPlaying.trackId
    );
    const prevIndex =
      (currentIndex - 1 + playlistRef.current.length) % playlistRef.current.length;
    playTrack(playlistRef.current[prevIndex]);
  }, [nowPlaying, playTrack]);

  /**
   * Seek to specific time
   */
  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  /**
   * Delete a track
   */
  const removeTrack = useCallback(
    async (trackId) => {
      try {
        await deleteTrack(trackId);
        
        // Stop playback if this track is playing
        if (nowPlaying?.trackId === trackId) {
          if (audioRef.current) {
            audioRef.current.pause();
            if (audioRef.current.src) {
              revokeObjectUrl(audioRef.current.src);
            }
            audioRef.current = null;
          }
          setNowPlaying(null);
          setIsPlaying(false);
          setProgress(0);
        }

        // Reload library
        await loadLibrary();
        setError(null);
      } catch (err) {
        console.error('Failed to delete track:', err);
        setError('Failed to delete track');
      }
    },
    [nowPlaying, loadLibrary]
  );

  /**
   * Search library
   */
  const search = useCallback(async (query) => {
    if (!query.trim()) {
      await loadLibrary();
      return;
    }

    try {
      const results = await searchTracks(query);
      setTracks(results);
      setError(null);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed');
    }
  }, [loadLibrary]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          revokeObjectUrl(audioRef.current.src);
        }
      }
      if (nowPlaying?.artwork) {
        revokeObjectUrl(nowPlaying.artwork);
      }
    };
  }, []);

  return {
    // Library state
    tracks,
    albums,
    artists,
    stats,
    isLoading,
    error,
    importProgress,

    // Playback state
    nowPlaying,
    isPlaying,
    progress,

    // Actions
    loadLibrary,
    importFiles,
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    removeTrack,
    search,
  };
}
