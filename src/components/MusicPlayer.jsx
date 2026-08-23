/**
 * MusicPlayer Component
 * Main orchestrator combining all components
 * - Vinyl disc + label display
 * - Playback controls
 * - Import panel
 * - Library view
 * - Tab navigation between modes
 */

import React, { useEffect, useState } from 'react';
import { useMusicLibrary } from '../hooks/useMusicLibrary';
import { VinylDisc } from './VinylDisc';
import { DiscLabel } from './DiscLabel';
import { ImportPanel } from './ImportPanel';
import { LibraryView } from './LibraryView';
import { generateColorFromString, DEFAULT_PALETTE } from '../lib/metadataUtils';

export function MusicPlayer() {
  const [activeTab, setActiveTab] = useState('player'); // 'player', 'import', 'library'
  const {
    tracks,
    albums,
    artists,
    stats,
    isLoading,
    error,
    importProgress,
    nowPlaying,
    isPlaying,
    progress,
    loadLibrary,
    importFiles,
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    removeTrack,
  } = useMusicLibrary();

  // Load library on mount
  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Get color palette from album
  const getPalette = () => {
    if (!nowPlaying?.track) return DEFAULT_PALETTE;
    const { albumName, artistNames } = nowPlaying.track;
    const seed = `${albumName}-${artistNames[0]}`;
    const color1 = generateColorFromString(seed);
    const color2 = generateColorFromString(seed + 'light');
    return [color1, color2, '#2a2a2a', '#8b7355'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 z-40 bg-black bg-opacity-80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-yellow-500">♫</span> Reverie
          </h1>
          <div className="flex items-center gap-2">
            {stats && (
              <p className="text-gray-400 text-sm">
                {stats.trackCount} tracks • {stats.albumCount} albums
              </p>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-gray-800 flex gap-0 max-w-7xl mx-auto">
          {[
            { id: 'player', label: '🎵 Player', icon: '♫' },
            { id: 'import', label: '📥 Import', icon: '+' },
            { id: 'library', label: '📚 Library', icon: '≡' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-yellow-500 border-yellow-500 bg-yellow-500 bg-opacity-5'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Player Tab */}
        {activeTab === 'player' && (
          <div className="space-y-8">
            {/* Vinyl Display */}
            <div className="flex justify-center">
              <div className="relative w-80 h-80">
                <VinylDisc
                  track={nowPlaying?.track}
                  isPlaying={isPlaying}
                  artworkBlob={nowPlaying?.artwork}
                  palette={getPalette()}
                />
                <DiscLabel
                  track={nowPlaying?.track}
                  isPlaying={isPlaying}
                  progress={progress}
                  duration={nowPlaying?.track?.duration || 0}
                  palette={getPalette()}
                />
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={playPrevious}
                disabled={!nowPlaying || tracks.length === 0}
                className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous track"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={togglePlayPause}
                disabled={!nowPlaying}
                className="p-4 rounded-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <svg
                  className="w-6 h-6 text-black"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isPlaying ? (
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  ) : (
                    <path d="M8 5v14l11-7z" />
                  )}
                </svg>
              </button>

              <button
                onClick={playNext}
                disabled={!nowPlaying || tracks.length === 0}
                className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next track"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 18h2V6h-2zm-11-7l8.5-6v12z" />
                </svg>
              </button>
            </div>

            {/* Volume/Seek Slider */}
            {nowPlaying && (
              <div className="max-w-md mx-auto space-y-2">
                <input
                  type="range"
                  min="0"
                  max={nowPlaying.track.duration || 100}
                  value={progress}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
            )}

            {/* Now Playing Info */}
            {nowPlaying ? (
              <div className="text-center space-y-2">
                <p className="text-gray-400 text-sm">Now Playing</p>
                <h2 className="text-2xl font-bold">{nowPlaying.track.title}</h2>
                <p className="text-gray-400">
                  {nowPlaying.track.artistNames.join(', ')}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No track selected</p>
                <p className="text-gray-500 text-sm mt-2">
                  Import music or click on a track in the library to start playing
                </p>
              </div>
            )}
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <ImportPanel
            onImport={importFiles}
            isLoading={isLoading}
            progress={importProgress}
            error={error}
          />
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <LibraryView
            tracks={tracks}
            albums={albums}
            artists={artists}
            stats={stats}
            onTrackClick={playTrack}
            onDeleteTrack={removeTrack}
          />
        )}
      </main>

      {/* Global Error Display */}
      {error && activeTab !== 'import' && (
        <div className="fixed bottom-6 right-6 bg-red-900 bg-opacity-90 text-red-200 px-4 py-3 rounded-lg shadow-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6 text-center text-gray-500 text-sm">
        <p>🎵 Reverie • Polished Vinyl Music Player</p>
        <p className="mt-1">Your music library stored locally and persisted with IndexedDB</p>
      </footer>
    </div>
  );
}
