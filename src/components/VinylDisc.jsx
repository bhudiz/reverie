/**
 * VinylDisc Component
 * Spinning vinyl record with embedded cover art
 * - Smooth rotation animation
 * - Cover art display (extracted from ID3 tags)
 * - Fallback gradient when no artwork
 * - Play/pause state affects rotation
 */

import React, { useEffect, useState } from 'react';
import { createObjectUrl, DEFAULT_PALETTE } from '../lib/metadataUtils';

export function VinylDisc({
  track,
  isPlaying,
  artworkBlob,
  palette = DEFAULT_PALETTE,
}) {
  const [artworkUrl, setArtworkUrl] = useState(null);
  const [showSpinner, setShowSpinner] = useState(!artworkBlob);

  useEffect(() => {
    if (!artworkBlob) {
      setArtworkUrl(null);
      setShowSpinner(true);
      return;
    }

    // Create object URL from artwork blob
    const url = createObjectUrl(artworkBlob);
    if (url) {
      setArtworkUrl(url);
      setShowSpinner(false);
    } else {
      setShowSpinner(true);
    }

    return () => {
      if (url) {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [artworkBlob]);

  // Create gradient fallback from palette
  const gradientStyle =
    palette && palette.length >= 2
      ? {
          background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 50%, ${palette[2] || palette[0]} 100%)`,
        }
      : { backgroundColor: palette?.[0] || '#1a1a1a' };

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer vinyl casing */}
      <div className="absolute inset-0 rounded-full shadow-2xl" style={gradientStyle}>
        {/* Vinyl grooves effect */}
        <div className="absolute inset-0 rounded-full opacity-20">
          <svg
            className="w-full h-full"
            viewBox="0 0 200 200"
            preserveAspectRatio="none"
          >
            {[...Array(12)].map((_, i) => (
              <circle
                key={i}
                cx="100"
                cy="100"
                r={30 + i * 12}
                fill="none"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        {/* Spinning disc with rotation */}
        <div
          className="absolute inset-0 rounded-full transition-transform"
          style={{
            animation: isPlaying
              ? 'spin 3s linear infinite'
              : 'none',
            transformOrigin: 'center',
          }}
        >
          {/* Cover art or fallback */}
          <div className="absolute inset-2 rounded-full overflow-hidden shadow-inner">
            {artworkUrl && !showSpinner ? (
              <img
                src={artworkUrl}
                alt={track?.title || 'Album art'}
                className="w-full h-full object-cover"
              />
            ) : (
              // Fallback: geometric pattern
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, ${palette?.[1] || '#d4af37'} 0%, ${palette?.[0] || '#1a1a1a'} 100%)`,
                }}
              >
                <div className="text-center text-white opacity-60">
                  <svg
                    className="w-16 h-16 mx-auto mb-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 7 15.5 7 14 7.67 14 8.5s.67 1.5 1.5 1.5z" />
                  </svg>
                  <p className="text-xs font-medium">No artwork</p>
                </div>
              </div>
            )}
          </div>

          {/* Center label */}
          <div className="absolute inset-8 rounded-full bg-black shadow-lg flex items-center justify-center">
            <div className="absolute inset-4 rounded-full bg-gradient-to-b from-gray-900 to-black opacity-80" />
            <div className="relative z-10 text-center px-4">
              <p className="text-xs font-bold text-yellow-600 truncate">
                REVERIE
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {track?.albumName?.slice(0, 12) || 'Music'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Playback indicator (small dot at bottom) */}
      {isPlaying && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg animate-pulse" />
        </div>
      )}

      {/* CSS for rotation animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
