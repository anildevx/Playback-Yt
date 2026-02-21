import { useEffect, useRef, useState, useCallback } from 'react';

export type PlayerState = 'unstarted' | 'playing' | 'paused' | 'buffering' | 'ended' | 'idle';

export interface YouTubePlayerControls {
  load: (videoId: string) => void;
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  playerState: PlayerState;
  currentTime: number;
  duration: number;
  volume: number;
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YT_STATE_MAP: Record<number, PlayerState> = {
  [-1]: 'unstarted',
  [0]: 'ended',
  [1]: 'playing',
  [2]: 'paused',
  [3]: 'buffering',
  [5]: 'idle',
};

export function useYouTubePlayer(containerId: string): YouTubePlayerControls {
  const playerRef = useRef<YT.Player | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backgroundPlaybackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingVideoId = useRef<string | null>(null);
  const isAPIReady = useRef(false);
  const intendedPlayState = useRef<'playing' | 'paused'>('paused');
  const isPageVisible = useRef(!document.hidden);

  const initPlayer = useCallback(() => {
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player(containerId, {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => {
          if (pendingVideoId.current) {
            playerRef.current?.loadVideoById(pendingVideoId.current);
            pendingVideoId.current = null;
          }
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          const state = YT_STATE_MAP[event.data] ?? 'idle';

          // Don't update state if page is hidden and player paused due to visibility
          if (!isPageVisible.current && state === 'paused' && intendedPlayState.current === 'playing') {
            // Player paused due to background, keep our intended state
            return;
          }

          setPlayerState(state);

          if (state === 'playing') {
            intendedPlayState.current = 'playing';
            setDuration(playerRef.current?.getDuration() ?? 0);
            intervalRef.current = setInterval(() => {
              setCurrentTime(playerRef.current?.getCurrentTime() ?? 0);
            }, 1000);
          } else {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            if (state === 'ended') {
              setCurrentTime(0);
              intendedPlayState.current = 'paused';
            } else if (state === 'paused' && isPageVisible.current) {
              // Only update intended state if pause happened while visible (user action)
              intendedPlayState.current = 'paused';
            }
          }
        },
      },
    });
  }, [containerId]);

  useEffect(() => {
    const setup = () => {
      isAPIReady.current = true;
      initPlayer();
    };

    if (window.YT && window.YT.Player) {
      setup();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        setup();
      };
    }

    // Handle visibility changes to manage background playback
    const handleVisibilityChange = () => {
      const wasVisible = isPageVisible.current;
      const isVisible = !document.hidden;
      isPageVisible.current = isVisible;

      if (!isVisible && intendedPlayState.current === 'playing') {
        // Page went to background while playing - start background playback keeper
        if (!backgroundPlaybackRef.current) {
          backgroundPlaybackRef.current = setInterval(() => {
            if (!isPageVisible.current && intendedPlayState.current === 'playing' && playerRef.current) {
              // Keep trying to play in background
              const state = playerRef.current.getPlayerState();
              if (state !== 1) { // 1 = YT.PlayerState.PLAYING
                playerRef.current.playVideo();
              }
            }
          }, 500); // Check every 500ms
        }
      } else if (isVisible) {
        // Page became visible - stop background keeper
        if (backgroundPlaybackRef.current) {
          clearInterval(backgroundPlaybackRef.current);
          backgroundPlaybackRef.current = null;
        }

        // Resume if needed
        if (!wasVisible && intendedPlayState.current === 'playing') {
          setTimeout(() => {
            if (isPageVisible.current && playerRef.current) {
              playerRef.current.playVideo();
            }
          }, 100);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (backgroundPlaybackRef.current) clearInterval(backgroundPlaybackRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initPlayer]);

  const load = useCallback((videoId: string) => {
    intendedPlayState.current = 'playing'; // Loading a video implies intent to play
    if (playerRef.current && isAPIReady.current) {
      playerRef.current.loadVideoById(videoId);
    } else {
      pendingVideoId.current = videoId;
    }
  }, []);

  const play = useCallback(() => {
    intendedPlayState.current = 'playing';
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    intendedPlayState.current = 'paused';
    // Clear background playback keeper when user pauses
    if (backgroundPlaybackRef.current) {
      clearInterval(backgroundPlaybackRef.current);
      backgroundPlaybackRef.current = null;
    }
    playerRef.current?.pauseVideo();
  }, []);

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((vol: number) => {
    playerRef.current?.setVolume(vol);
    setVolumeState(vol);
  }, []);

  return { load, play, pause, seek, setVolume, playerState, currentTime, duration, volume };
}
