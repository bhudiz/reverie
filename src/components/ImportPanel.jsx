/**
 * ImportPanel Component
 * Drag-drop file import UI with progress tracking
 * - Drag-drop zone for audio files
 * - File picker fallback
 * - Import progress indicator
 * - Success/error messages
 * - Supports: mp3, flac, m4a, wav, ogg, etc.
 */

import React, { useState, useRef } from 'react';

const SUPPORTED_FORMATS = ['.mp3', '.flac', '.m4a', '.wav', '.ogg', '.aac', '.wma'];

export function ImportPanel({ onImport, isLoading, progress, error }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    // Filter for audio files
    const audioFiles = Array.from(files).filter((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return SUPPORTED_FORMATS.includes(ext);
    });

    if (audioFiles.length === 0) {
      alert('No supported audio files found. Supported formats: ' + SUPPORTED_FORMATS.join(', '));
      return;
    }

    onImport(audioFiles);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const isImporting = progress.total > 0 && progress.current < progress.total;

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Drag-Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? 'border-yellow-500 bg-yellow-500 bg-opacity-10'
            : 'border-gray-600 hover:border-gray-500 bg-gray-900 bg-opacity-50'
        } ${isLoading || isImporting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isLoading && !isImporting ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={SUPPORTED_FORMATS.map((f) => f).join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading || isImporting}
        />

        {isImporting ? (
          // Import in progress
          <div className="space-y-4">
            <svg
              className="w-12 h-12 mx-auto text-yellow-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-white font-semibold">
              Importing... {progress.current} of {progress.total}
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        ) : isLoading ? (
          // Initial loading
          <div className="space-y-2">
            <svg
              className="w-12 h-12 mx-auto text-yellow-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-white font-semibold">Processing files...</p>
          </div>
        ) : (
          // Default state
          <div className="space-y-3">
            <svg
              className="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <div>
              <p className="text-white font-semibold">Drop audio files here</p>
              <p className="text-gray-400 text-sm mt-1">
                or click to select files
              </p>
            </div>
            <p className="text-gray-500 text-xs">
              Supported: {SUPPORTED_FORMATS.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm font-medium">Error: {error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-900 bg-opacity-20 border border-blue-700 border-opacity-50 rounded-lg">
        <p className="text-blue-300 text-sm">
          💡 <strong>Tip:</strong> Files are stored locally in your browser using IndexedDB.
          Your music library persists even after closing the app.
        </p>
      </div>
    </div>
  );
}
