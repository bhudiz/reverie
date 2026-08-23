/**
 * IndexedDB wrapper for persisting imported tracks + metadata
 * Stores: track metadata, file blobs, cover art blobs
 * Supports up to 2GB+ storage depending on browser quota
 */

import { openDB } from 'idb';

const DB_NAME = 'reverie-music-lib';
const DB_VERSION = 1;
const STORE_NAME = 'imported-tracks';

/**
 * Initialize or get the IndexedDB database
 */
export async function initDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-artist', 'artistNames', { multiEntry: true });
        store.createIndex('by-album', 'albumName');
        store.createIndex('by-date', 'importedAt');
      }
    },
  });
}

/**
 * Save a track entry to the database
 * Track entry includes: id, title, artistNames[], albumName, duration, fileBlob, artworkBlob
 */
export async function saveTrack(trackEntry) {
  const db = await initDb();
  return db.put(STORE_NAME, trackEntry);
}

/**
 * Get all imported tracks from database
 */
export async function getAllTracks() {
  const db = await initDb();
  return db.getAll(STORE_NAME);
}

/**
 * Get a single track by ID
 */
export async function getTrackById(id) {
  const db = await initDb();
  return db.get(STORE_NAME, id);
}

/**
 * Delete a track from the database
 */
export async function deleteTrack(id) {
  const db = await initDb();
  return db.delete(STORE_NAME, id);
}

/**
 * Get all tracks by album name
 */
export async function getTracksByAlbum(albumName) {
  const db = await initDb();
  return db.getAllFromIndex(STORE_NAME, 'by-album', albumName);
}

/**
 * Get all tracks by artist name
 */
export async function getTracksByArtist(artistName) {
  const db = await initDb();
  return db.getAllFromIndex(STORE_NAME, 'by-artist', artistName);
}

/**
 * Search tracks by title, album, or artist (case-insensitive)
 */
export async function searchTracks(query) {
  const db = await initDb();
  const allTracks = await db.getAll(STORE_NAME);
  const lower = query.toLowerCase();
  
  return allTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(lower) ||
      t.albumName.toLowerCase().includes(lower) ||
      t.artistNames.some((a) => a.toLowerCase().includes(lower)) ||
      t.fileName.toLowerCase().includes(lower)
  );
}

/**
 * Get track count
 */
export async function getTrackCount() {
  const db = await initDb();
  return db.count(STORE_NAME);
}

/**
 * Clear entire library (destructive!)
 */
export async function clearLibrary() {
  const db = await initDb();
  return db.clear(STORE_NAME);
}

/**
 * Get library stats: total tracks, albums, artists, total duration
 */
export async function getLibraryStats() {
  const tracks = await getAllTracks();
  
  const albums = new Set(tracks.map(t => t.albumName));
  const artists = new Set();
  tracks.forEach(t => t.artistNames.forEach(a => artists.add(a)));
  
  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  
  return {
    trackCount: tracks.length,
    albumCount: albums.size,
    artistCount: artists.size,
    totalDuration,
    albums: Array.from(albums),
    artists: Array.from(artists),
  };
}

/**
 * Get all unique albums with metadata
 */
export async function getAlbums() {
  const tracks = await getAllTracks();
  const albumMap = new Map();
  
  tracks.forEach(track => {
    if (!albumMap.has(track.albumName)) {
      albumMap.set(track.albumName, {
        name: track.albumName,
        artists: new Set(track.artistNames),
        trackCount: 0,
        duration: 0,
        artworkBlob: track.artworkBlob || null,
        tracks: [],
      });
    }
    const album = albumMap.get(track.albumName);
    track.artistNames.forEach(a => album.artists.add(a));
    album.trackCount += 1;
    album.duration += track.duration || 0;
    album.tracks.push(track);
  });
  
  return Array.from(albumMap.values()).map(a => ({
    ...a,
    artists: Array.from(a.artists),
  }));
}

/**
 * Get all unique artists with metadata
 */
export async function getArtists() {
  const tracks = await getAllTracks();
  const artistMap = new Map();
  
  tracks.forEach(track => {
    track.artistNames.forEach(artist => {
      if (!artistMap.has(artist)) {
        artistMap.set(artist, {
          name: artist,
          trackCount: 0,
          albumCount: 0,
          duration: 0,
          albums: new Set(),
          tracks: [],
        });
      }
      const artistData = artistMap.get(artist);
      artistData.trackCount += 1;
      artistData.duration += track.duration || 0;
      artistData.albums.add(track.albumName);
      artistData.tracks.push(track);
    });
  });
  
  return Array.from(artistMap.values()).map(a => ({
    ...a,
    albumCount: a.albums.size,
    albums: Array.from(a.albums),
  }));
}
