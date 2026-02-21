# 🎵 PlayBack

A Progressive Web App (PWA) demonstrating YouTube background audio playback using modern web APIs.

![PWA](https://img.shields.io/badge/PWA-Enabled-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-18.x-blue)
![Vite](https://img.shields.io/badge/Vite-5.x-purple)

---

<div align="center">

### ⭐ If you find this project useful for learning, please consider giving it a star! ⭐

[![GitHub stars](https://img.shields.io/github/stars/anildevx/Playback-Yt?style=social)](https://github.com/anildevx/Playback-Yt/stargazers)

**It helps others discover this educational resource and motivates continued development!**

[🌟 Star this Repository](https://github.com/anildevx/Playback-Yt/stargazers)

</div>

---

## ⚠️ Important Notice

**This is an educational project** created to demonstrate:
- Progressive Web App development
- YouTube IFrame API integration
- Media Session API implementation
- Service Worker and offline capabilities
- Background audio handling in mobile browsers

### Educational Purpose Only

This project is intended for:
- ✅ Learning web development concepts
- ✅ Understanding PWA architecture
- ✅ Exploring browser APIs

**Not intended for:**
- ❌ Production use or wide distribution
- ❌ Replacement of YouTube Premium features
- ❌ Commercial purposes

### Support Content Creators

YouTube Premium offers official background playback along with:
- Ad-free experience supporting creators
- Offline downloads
- YouTube Music access
- Picture-in-Picture mode

**Please consider subscribing to [YouTube Premium](https://www.youtube.com/premium) to support content creators.**

---

## 🚀 Features

### Core Functionality
- 🎥 **YouTube Video Playback** - Play any YouTube video by URL or ID
- 🎵 **Background Audio** - Continue playback when app is minimized (via Media Session API)
- 📱 **System Media Controls** - Control playback from notification shade/lock screen
- 💾 **Watch History** - Automatically saves last 10 played videos
- 🎨 **Modern UI** - Clean, dark theme interface optimized for mobile
- ⚡ **Offline Ready** - Service worker caches app shell for offline access

### PWA Features
- 📲 **Installable** - Add to home screen on mobile/desktop
- 🔔 **Install Prompt** - Smart first-time visitor install recommendation
- 🎯 **Standalone Mode** - Runs like a native app
- 🖼️ **App Icons** - Custom icons for all platforms
- 📊 **Manifest** - Complete web app manifest configuration

### Technical Features
- ⚛️ **React 18** - Modern component architecture
- 📘 **TypeScript** - Full type safety
- 🎨 **CSS Custom Properties** - Dynamic theming
- 🔄 **State Management** - React hooks and refs
- 📦 **Optimized Build** - Vite for fast development and production builds

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 5.4** - Build tool and dev server
- **CSS3** - Styling with custom properties

### APIs & Services
- **YouTube IFrame Player API** - Video playback
- **Media Session API** - System media controls
- **Service Worker API** - Offline capabilities and caching
- **localStorage** - Persistent history storage

### PWA Tools
- **vite-plugin-pwa** - Service worker generation
- **Workbox** - Advanced caching strategies
- **Web App Manifest** - App metadata and icons

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Modern browser (Chrome, Edge, Safari, Firefox)

### Development

```bash
# Clone the repository
git clone https://github.com/anildevx/Playback-Yt.git
cd Playback-Yt

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

The app is configured for deployment on Vercel, or any static hosting service.

**Vercel:**
```bash
npm run build
# Deploy the dist/ folder
```

The `vercel.json` configuration handles:
- SPA routing (all routes → index.html)
- Service worker headers (no-cache for sw.js)
- Security headers (X-Frame-Options, CSP, etc.)

---

## 📱 Usage

### Playing Videos

1. **Enter YouTube URL** - Paste any YouTube video URL in the input field
2. **Supported Formats:**
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`
   - `https://www.youtube.com/shorts/VIDEO_ID`
   - `https://www.youtube.com/embed/VIDEO_ID`
   - Or just the `VIDEO_ID`

3. **Controls:**
   - Play/Pause button
   - Seek slider for navigation
   - Volume control
   - Minimize to continue in background

### Background Playback

1. Start playing a video
2. Click the **Minimize** button (⊟)
3. Music stops when minimized (browser security policy)
4. **Tap Play in notification controls** to resume
5. Music continues playing in background
6. Use notification controls for play/pause/seek

### Install as App

1. Visit the app in a supported browser
2. You'll see an install prompt on first visit
3. Click **"Install App"** to add to home screen
4. Or use browser's "Add to Home Screen" / "Install" option

---

## 🏗️ Architecture

### Project Structure

```
PlayBack/
├── src/
│   ├── components/          # React components
│   │   ├── LinkInput.tsx    # URL input and validation
│   │   ├── VideoInfo.tsx    # Video title, author, thumbnail
│   │   ├── PlayerControls.tsx # Play, pause, seek, volume
│   │   └── MiniPlayer.tsx   # Floating mini player overlay
│   ├── hooks/               # Custom React hooks
│   │   ├── useYouTubePlayer.ts  # YouTube IFrame API wrapper
│   │   └── useMediaSession.ts   # Media Session API integration
│   ├── utils/               # Utility functions
│   │   └── youtube.ts       # URL parsing, metadata fetching
│   ├── App.tsx             # Main app component
│   ├── App.css             # Global styles
│   └── main.tsx            # React entry point
├── public/
│   ├── icons/              # PWA icons (192x192, 512x512)
│   └── manifest.webmanifest # PWA manifest
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── vercel.json            # Vercel deployment config
└── package.json
```

### Key Components

**App.tsx** - Main component managing:
- View routing (home/player)
- Video loading and state
- History management
- PWA install prompt

**useYouTubePlayer.ts** - YouTube player lifecycle:
- IFrame API initialization
- Video loading with `cueVideoById`
- Playback controls (play, pause, seek, volume)
- State tracking and updates
- Visibility handling for background playback

**useMediaSession.ts** - Media controls:
- Metadata updates (title, artist, artwork)
- Action handlers (play, pause, seek forward/backward)
- Position state synchronization

**youtube.ts** - Utility functions:
- URL parsing for multiple YouTube formats
- Video metadata fetching via oEmbed API

### Background Playback Flow

```
1. User loads video → cueVideoById (doesn't auto-play)
2. User clicks play → playVideo() (only if page visible)
3. User minimizes → Browser pauses video
4. User taps notification play → Media Session API calls play()
5. playVideo() executes → Background playback starts
6. User controls via notifications → Smooth playback
```

### Service Worker Caching

**App Shell** (precached):
- HTML, CSS, JavaScript bundles
- PWA manifest and icons
- Service worker registration

**YouTube Thumbnails** (cache-first, 30 days):
- Faster repeated video loads
- Reduced bandwidth

**Video Metadata** (network-first, 1 day):
- Fresh data with fallback to cache

---

## 🚧 Known Limitations

### Browser Security Restrictions
- **Auto-play policies:** Background playback requires user gesture (notification controls)
- **iOS Safari:** Limited Media Session API support on older versions
- **Firefox:** Some PWA features may not work in private browsing

### YouTube API Limitations
- **Ad-free playback:** Videos load without ads (small player size bypass)
- **Age-restricted content:** May not load properly
- **Premium content:** Not accessible without authentication
- **Rate limiting:** oEmbed API has rate limits for metadata fetching

### PWA Installation
- **Desktop Chrome/Edge:** Full support
- **Mobile Chrome/Android:** Full support
- **iOS Safari:** Requires manual "Add to Home Screen"
- **Firefox:** Limited PWA install support

---

## 🤝 Contributing

This is an educational project, but contributions for learning purposes are welcome!

### Areas for Improvement
- [ ] Add playlist support
- [ ] Implement queue management
- [ ] Add keyboard shortcuts
- [ ] Improve error handling
- [ ] Add more video info (views, upload date)
- [ ] Implement video quality selection
- [ ] Add search functionality
- [ ] Create settings page

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with descriptive messages
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

### Important Legal Notes

**YouTube Terms of Service:**
This project uses YouTube's public APIs and may be subject to YouTube's Terms of Service. Use at your own discretion.

**Educational Use:**
This project is intended for educational purposes. Commercial use or wide distribution may violate YouTube's Terms of Service.

**Content Creator Support:**
Please support content creators through official YouTube features including:
- Watching ads
- YouTube Premium subscriptions
- Channel memberships
- Direct donations/support

---

## 🙏 Acknowledgments

### Technologies
- [React](https://react.dev) - UI framework
- [Vite](https://vitejs.dev) - Build tool
- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) - Video playback
- [Workbox](https://developer.chrome.com/docs/workbox/) - Service worker utilities

### Inspiration
This project was created to learn about:
- PWA development best practices
- Media Session API integration
- YouTube IFrame API usage
- Service Worker caching strategies

---

## 📞 Contact

**Project Link:** [https://github.com/anildevx/Playback-Yt](https://github.com/anildevx/Playback-Yt)

**Issues:** [https://github.com/anildevx/Playback-Yt/issues](https://github.com/anildevx/Playback-Yt/issues)

---

## 📚 Learning Resources

If you're interested in learning the technologies used in this project:

### PWA Development
- [web.dev - Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

### Media Session API
- [MDN - Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)
- [web.dev - Media Session](https://web.dev/media-session/)

### YouTube IFrame API
- [YouTube IFrame Player API Reference](https://developers.google.com/youtube/iframe_api_reference)

### React & TypeScript
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Built with ❤️ for learning and exploration**

**Remember:** For the best experience and to support creators, use [YouTube Premium](https://www.youtube.com/premium) 🎵
