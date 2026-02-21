import { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import { LinkInput } from './components/LinkInput';
import { VideoInfo } from './components/VideoInfo';
import { PlayerControls } from './components/PlayerControls';
import { MiniPlayer } from './components/MiniPlayer';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { useMediaSession } from './hooks/useMediaSession';
import { fetchVideoMeta } from './utils/youtube';
import type { VideoMeta } from './utils/youtube';

const PLAYER_CONTAINER_ID = 'yt-player-container';
const HISTORY_KEY = 'playback-history';
const MAX_HISTORY = 10;

interface HistoryItem {
  videoId: string;
  title: string;
  thumbnail: string;
  author: string;
}

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

type View = 'home' | 'player';

export default function App() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [view, setView] = useState<View>('home');
  const [isMini, setIsMini] = useState(false);
  const [metaError, setMetaError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(false);

  const { load, play, pause, seek, setVolume, playerState, currentTime, duration, volume } =
    useYouTubePlayer(PLAYER_CONTAINER_ID);

  const handleVideoId = useCallback(
    async (id: string) => {
      if (loadedRef.current && id === videoId) {
        setView('player');
        setIsMini(false);
        return;
      }
      loadedRef.current = true;
      setLoading(true);
      setMetaError('');
      try {
        const meta = await fetchVideoMeta(id);
        setVideoId(id);
        setVideoMeta(meta);
        setView('player');
        setIsMini(false);
        load(id);

        // Update history
        const item: HistoryItem = { videoId: id, ...meta };
        setHistory((prev) => {
          const filtered = prev.filter((h) => h.videoId !== id);
          const updated = [item, ...filtered].slice(0, MAX_HISTORY);
          saveHistory(updated);
          return updated;
        });
      } catch {
        setMetaError('Could not load video info. Check the URL and try again.');
      } finally {
        setLoading(false);
      }
    },
    [videoId, load]
  );

  const handlePlay = useCallback(() => play(), [play]);
  const handlePause = useCallback(() => pause(), [pause]);
  const handleSeek = useCallback((s: number) => seek(s), [seek]);

  useMediaSession({
    title: videoMeta?.title ?? '',
    artist: videoMeta?.author ?? '',
    thumbnail: videoMeta?.thumbnail ?? '',
    duration,
    currentTime,
    onPlay: handlePlay,
    onPause: handlePause,
    onSeek: handleSeek,
  });

  // Switch to mini when navigating back home while playing
  const handleBack = () => {
    setView('home');
    if (playerState === 'playing' || playerState === 'buffering') {
      setIsMini(true);
    }
  };

  const handleMinimize = () => {
    setView('home');
    setIsMini(true);
  };

  const handleExpand = () => {
    setView('player');
    setIsMini(false);
  };

  // Sync media session playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (playerState === 'playing') {
      navigator.mediaSession.playbackState = 'playing';
    } else if (playerState === 'paused' || playerState === 'ended') {
      navigator.mediaSession.playbackState = 'paused';
    }
  }, [playerState]);

  const showMini = isMini && videoMeta && (playerState === 'playing' || playerState === 'paused' || playerState === 'buffering');

  return (
    <div className="app">
      {/* Hidden YouTube player — always in DOM */}
      <div id={PLAYER_CONTAINER_ID} className="yt-hidden" aria-hidden="true" />

      {view === 'home' && (
        <div className="home-view">
          <header className="home-header">
            <div className="logo-mark">▶</div>
            <h1 className="app-name">PlayBack</h1>
            <p className="app-tagline">YouTube audio, playing in the background</p>
          </header>

          <main className="home-main">
            <LinkInput onVideoId={handleVideoId} />
            {loading && <p className="loading-text">Loading…</p>}
            {metaError && <p className="error-text">{metaError}</p>}

            {history.length > 0 && (
              <section className="history-section">
                <h2 className="history-heading">Recent</h2>
                <ul className="history-list">
                  {history.map((item) => (
                    <li key={item.videoId}>
                      <button
                        className="history-item"
                        onClick={() => handleVideoId(item.videoId)}
                      >
                        <img src={item.thumbnail} alt="" className="history-thumb" />
                        <div className="history-info">
                          <span className="history-title">{item.title}</span>
                          <span className="history-author">{item.author}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </main>
        </div>
      )}

      {view === 'player' && videoId && videoMeta && (
        <div className="player-view">
          <div className="player-topbar">
            <button className="btn-back" onClick={handleBack} aria-label="Back">
              ‹ Back
            </button>
            <button className="btn-minimize" onClick={handleMinimize} aria-label="Minimize">
              ⊟
            </button>
          </div>

          <VideoInfo videoId={videoId} meta={videoMeta} />

          <PlayerControls
            playerState={playerState}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            onVolume={setVolume}
          />
        </div>
      )}

      {showMini && videoMeta && (
        <MiniPlayer
          meta={videoMeta}
          playerState={playerState}
          onPlay={handlePlay}
          onPause={handlePause}
          onExpand={handleExpand}
        />
      )}
    </div>
  );
}
