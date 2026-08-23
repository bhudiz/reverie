/**
 * DiscLabel Component
 * Non-rotating vinyl label overlay
 * - Album title and artist names
 * - Current track info
 * - Progress bar
 * - Duration display
 * - Stays stationary while vinyl spins behind it
 */

import React from 'react';
import { formatDuration } from '../lib/metadataUtils';

export function DiscLabel({
  track,
  isPlaying,
  progress,
  duration,
  palette = ['#1a1a1a', '#d4af37'],
}) {
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center pointer-events-none">
      {/* Semi-transparent overlay for text readability */}
      <div className="absolute inset-0 rounded-full bg-black opacity-40" />

      {/* Content container - stays stationary */}
      <div className="relative z-20 text-center px-6 max-w-full">
        {/* Album Title */}
        <div className="mb-3">
          <p
            className="text-xs font-semibold uppercase tracking-wider truncate"
            style={{ color: palette[1] || '#d4af37' }}
          >
            {track?.albumName || 'Album'}
          </p>
        </div>

        {/* Track Title */}
        <div className="mb-2">
          <p className="text-sm font-bold text-white truncate">
            {track?.title || 'Now Playing'}
          </p>
        </div>

        {/* Artists */}
        <div className="mb-4">
          <p className="text-xs text-gray-300 truncate">
            {track?.artistNames?.join(', ') || 'Unknown Artist'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-3 w-32">
          <div
            className="h-1 rounded-full opacity-50"
            style={{ backgroundColor: palette[1] || '#d4af37' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: palette[1] || '#d4af37',
              }}
            />
          </div>
        </div>

        {/* Time Display */}
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{formatDuration(progress)}</span>
          <span>/</span>
          <span>{formatDuration(duration)}</span>
        </div>

        {/* Play Status Indicator */}
        {isPlaying && (
          <div className="mt-3 flex justify-center gap-1">
            <div
              className="w-1 h-3 rounded-full animate-pulse"
              style={{
                backgroundColor: palette[1] || '#d4af37',
                animationDelay: '0s',
              }}
            />
            <div
              className="w-1 h-3 rounded-full animate-pulse"
              style={{
                backgroundColor: palette[1] || '#d4af37',
                animationDelay: '0.1s',
              }}
            />
            <div
              className="w-1 h-3 rounded-full animate-pulse"
              style={{
                backgroundColor: palette[1] || '#d4af37',
                animationDelay: '0.2s',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
