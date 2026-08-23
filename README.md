# 🎵 Reverie - Polished Vinyl Music Player

A beautiful, modern web-based music player with a spinning vinyl disc visualization and local music library management. Built with React, Vite, and Tailwind CSS.

## ✨ Features

### 🎛️ Core Playback
- **Spinning Vinyl Visualization** - Watch your music play with an animated vinyl disc
- **Full Playback Controls** - Play, pause, next, previous with intuitive UI
- **Progress Tracking** - Visual progress bar with seek support
- **Duration Display** - Current time / total duration for every track

### 📚 Library Management
- **Local Storage** - Music library stored entirely in browser using IndexedDB (no server needed)
- **Persistent Data** - Your library persists even after closing the app
- **Search & Filter** - Search by track name, album, or artist
- **Album View** - Browse your music by album with cover art
- **Artist View** - Explore tracks organized by artist
- **Track Management** - Delete unwanted tracks from your library

### 📥 File Import
- **Drag & Drop** - Simply drag audio files into the player
- **File Picker** - Classic file selection as a fallback
- **Format Support** - MP3, FLAC, M4A, WAV, OGG, AAC, WMA
- **Metadata Parsing** - Automatically extracts ID3 tags (artist, album, title, cover art)
- **Batch Import** - Import multiple files at once with progress tracking
- **Error Handling** - Graceful fallbacks for files with missing metadata

### 🎨 Visual Features
- **Cover Art Display** - Album artwork embedded in the vinyl disc
- **Color Palette Generation** - Dynamic colors derived from album data
- **Smooth Animations** - Vinyl rotation, label overlays, and progress indicators
- **Responsive Design** - Works on desktop and mobile devices
- **Dark Theme** - Eye-friendly interface with elegant gold accents

### 📊 Library Statistics
- Track count
- Album count
- Artist count
- Total library duration

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser with IndexedDB support

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/bhudiz/reverie.git
cd reverie
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
reverie/
├── src/
│   ├── components/
│   │   ├── MusicPlayer.jsx       # Main orchestrator component
│   │   ├── VinylDisc.jsx         # Spinning vinyl visualization
│   │   ├── DiscLabel.jsx         # Track info overlay (non-rotating)
│   │   ├── ImportPanel.jsx       # Drag-drop file import UI
│   │   └── LibraryView.jsx       # Album/artist/track browsing
│   ├── hooks/
│   │   └── useMusicLibrary.js    # Core library & playback logic
│   ├── lib/
│   │   ├── musicDb.js            # IndexedDB operations
│   │   └── metadataUtils.js      # Metadata parsing & utilities
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── index.html                    # HTML entry point
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
└── package.json                  # Dependencies & scripts
```

## 🔧 Architecture

### Data Flow

```
File Input (Drag/Drop)
    ↓
ImportPanel Component
    ↓
useMusicLibrary Hook
    ↓
parseBlob() - Extract metadata
    ↓
musicDb - Store in IndexedDB
    ↓
LibraryView / MusicPlayer - Display
```

### State Management

The `useMusicLibrary` custom hook manages:
- **Library state**: tracks, albums, artists, statistics
- **Playback state**: current track, playing status, progress
- **Import state**: progress tracking, error handling
- **UI state**: loading indicators

### Storage

All music data persists in IndexedDB:
- **Tracks table** - Full track data with metadata and audio blob
- **Albums index** - Efficient album lookups
- **Artists index** - Efficient artist lookups
- **Search index** - Fast full-text search

## 🎨 Customization

### Styling

The app uses Tailwind CSS with custom gold/brown theme. Modify `tailwind.config.js` to adjust colors:

```javascript
theme: {
  extend: {
    colors: {
      gold: '#d4af37',  // Vinyl label gold
      // Add more custom colors here
    },
  },
}
```

### Supported Audio Formats

Edit `SUPPORTED_FORMATS` in `src/components/ImportPanel.jsx`:

```javascript
const SUPPORTED_FORMATS = ['.mp3', '.flac', '.m4a', '.wav', '.ogg', '.aac', '.wma'];
```

### Playback Speed

Adjust vinyl rotation speed in `src/components/VinylDisc.jsx`:

```javascript
animation: isPlaying ? 'spin 3s linear infinite' : 'none',
// Change '3s' to adjust rotation speed
```

## 🛠️ Technologies Used

- **React 18** - UI library
- **Vite 4** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **music-metadata-browser** - ID3 tag parsing
- **idb** - IndexedDB wrapper
- **HTML5 Audio API** - Playback control

## 🎵 Key Components

### VinylDisc Component
Renders the spinning vinyl with:
- Grooved vinyl effect (SVG circles)
- Embedded cover art or gradient fallback
- Smooth CSS rotation animation
- Center label with album info

### DiscLabel Component
Non-rotating overlay showing:
- Album title and artist names
- Current track info
- Progress bar
- Time display (current / duration)
- Playback indicator dots

### ImportPanel Component
Drag-drop interface with:
- Visual feedback on drag/drop
- File format validation
- Import progress tracking
- Error messages and tips

### LibraryView Component
Multi-view browsing:
- **Album View** - Grid of album covers
- **Track View** - Detailed track list with delete option
- **Artist View** - Artists with track/album counts

### useMusicLibrary Hook
Orchestrates:
- File import and metadata parsing
- Audio playback control
- Library persistence (IndexedDB)
- Search and filtering

## 💾 Data Persistence

All data is stored locally in the browser's IndexedDB:
- No data is sent to servers
- No analytics or tracking
- Data persists across browser sessions
- Clear browser data to reset library

## ⚙️ Browser Support

- Chrome/Edge 60+
- Firefox 55+
- Safari 11+
- Opera 47+

Requires IndexedDB support (available in all modern browsers).

## 🐛 Known Limitations

- Large audio files (>100MB) may be slow to process
- Cover art extraction works best with properly tagged files
- No cross-origin audio file support (CORS restrictions)
- Mobile autoplay may be restricted by browser policies

## 🚀 Future Enhancements

- [ ] Playlist creation and management
- [ ] Shuffle and repeat modes
- [ ] Equalizer with presets
- [ ] Keyboard shortcuts
- [ ] Export/import library backups
- [ ] Theme customization
- [ ] Recently played tracking
- [ ] Favorites/starred tracks
- [ ] Integration with streaming services

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💡 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 🎵 Credits

Built with ❤️ by bhudiz

Inspired by the nostalgia of vinyl records and the modern web platform.

---

**Enjoy your music! 🎧**
