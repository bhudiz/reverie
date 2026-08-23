/**
 * LibraryView Component
 * Album grid + track list with search
 * - Display albums with artwork
 * - Search and filter tracks
 * - View tracks by album or artist
 * - Delete tracks from library
 */

import React, { useState, useCallback } from 'react';
import { formatDuration } from '../lib/metadataUtils';

export function LibraryView({
  tracks,
  albums,
  artists,
  stats,
  onTrackClick,
  onDeleteTrack,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('albums'); // 'albums', 'tracks', 'artists'
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);

  // Filter tracks based on search and selections
  const filteredTracks = useCallback(() => {
    let result = tracks;

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.albumName.toLowerCase().includes(lower) ||
          t.artistNames.some((a) => a.toLowerCase().includes(lower))
      );
    }

    if (selectedAlbum) {
      result = result.filter((t) => t.albumName === selectedAlbum);
    }

    if (selectedArtist) {
      result = result.filter((t) => t.artistNames.includes(selectedArtist));
    }

    return result;
  }, [tracks, searchQuery, selectedAlbum, selectedArtist]);

  const displayTracks = filteredTracks();

  return (
    <div className="w-full space-y-6">
      {/* Header with Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-5">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs font-semibold uppercase">Tracks</p>
            <p className="text-white text-2xl font-bold">{stats.trackCount}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs font-semibold uppercase">Albums</p>
            <p className="text-white text-2xl font-bold">{stats.albumCount}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs font-semibold uppercase">Artists</p>
            <p className="text-white text-2xl font-bold">{stats.artistCount}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs font-semibold uppercase">Duration</p>
            <p className="text-white text-2xl font-bold">
              {Math.floor(stats.totalDuration / 3600)}h
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="px-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tracks, albums, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-500"
          />
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 px-5 border-b border-gray-700">
        {['albums', 'tracks', 'artists'].map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setViewMode(mode);
              setSelectedAlbum(null);
              setSelectedArtist(null);
            }}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              viewMode === mode
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="px-5 pb-6">
        {viewMode === 'albums' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map((album) => (
              <div
                key={album.name}
                onClick={() => {
                  setSelectedAlbum(album.name);
                  setViewMode('tracks');
                }}
                className="group cursor-pointer"
              >
                <div className="bg-gray-800 rounded-lg overflow-hidden aspect-square mb-3 relative">
                  {album.artworkBlob ? (
                    <img
                      src={URL.createObjectURL(album.artworkBlob)}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 3v9.28c-.47-.29-.99-.28-1.5 0C9.36 12.66 8.5 13.56 8.5 14.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V6h4v7.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5c0-.94-.86-1.84-2-1.98V3h3V1h-8z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-sm truncate">
                  {album.name}
                </h3>
                <p className="text-gray-400 text-xs truncate">
                  {album.artists.join(', ')}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {album.trackCount} tracks
                </p>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'artists' && (
          <div className="space-y-3">
            {artists.map((artist) => (
              <div
                key={artist.name}
                onClick={() => {
                  setSelectedArtist(artist.name);
                  setViewMode('tracks');
                }}
                className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-white font-semibold">{artist.name}</h3>
                <p className="text-gray-400 text-sm">
                  {artist.trackCount} tracks • {artist.albumCount} albums
                </p>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'tracks' && (
          <div className="space-y-2">
            {displayTracks.length > 0 ? (
              displayTracks.map((track) => (
                <div
                  key={track.id}
                  className="group bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onTrackClick(track)}
                  >
                    <p className="text-white font-medium truncate">{track.title}</p>
                    <p className="text-gray-400 text-sm">
                      {track.artistNames.join(', ')} • {track.albumName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <p className="text-gray-400 text-sm">
                      {formatDuration(track.duration)}
                    </p>
                    <button
                      onClick={() => onDeleteTrack(track.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete track"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No tracks found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
