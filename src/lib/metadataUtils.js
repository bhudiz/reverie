/**
 * Metadata utilities for music file parsing
 * - Extract ID3 tags with multi-artist support
 * - Parse durations
 * - Handle cover art extraction
 */

/**
 * Split raw artist tag into array of individual artist names
 * Handles: "feat.", "ft.", "&", ",", "/", ";", "and" (case-insensitive)
 */
export function splitArtistNames(raw) {
  if (!raw) return ['Unknown Artist'];

  // Remove parenthetical notes like (Remix) or (feat. Someone)
  let normalized = raw.replace(/\s*\(.*?\)\s*/g, '');

  // Replace common separator tokens
  normalized = normalized
    .replace(/feat\.?/gi, ',')
    .replace(/ft\.?/gi, ',')
    .replace(/\bfeaturing\b/gi, ',');

  // Split on: comma, &, /, semicolon, or the word "and"
  const parts = normalized
    .split(/\s*(?:,|&|\/|;|\band\b)\s*/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return parts.length > 0 ? parts : ['Unknown Artist'];
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Create a blob-based object URL
 * Returns null if failed
 */
export function createObjectUrl(blob) {
  try {
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Failed to create object URL:', e);
    return null;
  }
}

/**
 * Revoke an object URL to free memory
 */
export function revokeObjectUrl(url) {
  try {
    if (url) URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Failed to revoke object URL:', e);
  }
}

/**
 * Extract cover art from metadata picture array
 * music-metadata-browser returns picture as an array or single object
 */
export function extractCoverArt(picture) {
  if (!picture) return null;

  // Handle array or single object
  const pic = Array.isArray(picture) && picture.length > 0 ? picture[0] : picture;

  if (!pic || !pic.data) return null;

  try {
    // Create blob from picture data
    const uint8 = new Uint8Array(pic.data);
    const blob = new Blob([uint8], { type: pic.format || 'image/jpeg' });
    return blob;
  } catch (e) {
    console.error('Failed to extract cover art:', e);
    return null;
  }
}

/**
 * Generate a unique ID for imported track
 */
export function generateTrackId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Default color palette for tracks without artwork
 */
export const DEFAULT_PALETTE = ['#1a1a1a', '#d4af37', '#2a2a2a', '#8b7355'];

/**
 * Generate a deterministic color from a string (for artist/album grouping)
 */
export function generateColorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 65;
  const lightness = 45;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
