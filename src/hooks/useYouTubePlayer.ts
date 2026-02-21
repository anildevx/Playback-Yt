import { useEffect, useRef, useState, useCallback } from 'react';

export type PlayerState = 'unstarted' | 'playing' | 'paused' | 'buffering' | 'ended' | 'idle';

export interface YouTubePlayerControls {
  load: (videoId: string, autoPlay?: boolean) => void;
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
  const pendingVideoId = useRef<string | null>(null);
  const isAPIReady = useRef(false);
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
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          if (pendingVideoId.current) {
            playerRef.current?.cueVideoById(pendingVideoId.current);
            pendingVideoId.current = null;
          }
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          const state = YT_STATE_MAP[event.data] ?? 'idle';
          setPlayerState(state);

          if (state === 'playing') {
            setDuration(playerRef.current?.getDuration() ?? 0);

            // Start time tracking
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
              setCurrentTime(playerRef.current?.getCurrentTime() ?? 0);
            }, 1000);
          } else {
            // Clear time tracking interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            if (state === 'ended') {
              setCurrentTime(0);
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

    // Track visibility and pause when hidden to prevent stuttering
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      isPageVisible.current = isVisible;

      // When page becomes hidden, explicitly pause to prevent auto-resume attempts
      if (!isVisible && playerRef.current) {
        const state = playerRef.current.getPlayerState();
        if (state === 1) { // 1 = YT.PlayerState.PLAYING
          playerRef.current.pauseVideo();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initPlayer]);

  const load = useCallback((videoId: string, autoPlay = false) => {
    if (playerRef.current && isAPIReady.current) {
      if (autoPlay && isPageVisible.current) {
        // Use loadVideoById for auto-play (only when page is visible)
        playerRef.current.loadVideoById(videoId);
      } else {
        // Use cueVideoById to just load without playing
        playerRef.current.cueVideoById(videoId);
      }
    } else {
      pendingVideoId.current = videoId;
    }
  }, []);

  const play = useCallback(() => {
    // Allow play even when hidden - this is for Media Session API
    // which provides user gesture context
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
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
