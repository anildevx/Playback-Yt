import { useEffect } from 'react';

interface MediaSessionOptions {
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  currentTime: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (seconds: number) => void;
}

export function useMediaSession({
  title,
  artist,
  thumbnail,
  duration,
  currentTime,
  onPlay,
  onPause,
  onSeek,
}: MediaSessionOptions) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!title) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'PlayBack',
      artwork: [
        { src: thumbnail, sizes: '480x360', type: 'image/jpeg' },
      ],
    });
  }, [title, artist, thumbnail]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    // Media Session handlers will trigger when user interacts with system controls
    // The play handler works with visibility detection in useYouTubePlayer
    navigator.mediaSession.setActionHandler('play', onPlay);
    navigator.mediaSession.setActionHandler('pause', onPause);
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) {
        onSeek(details.seekTime);
      }
    });
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      onSeek(Math.max(0, currentTime - (details.seekOffset ?? 10)));
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      onSeek(Math.min(duration, currentTime + (details.seekOffset ?? 10)));
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekto', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    };
  }, [onPlay, onPause, onSeek, currentTime, duration]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!duration) return;

    navigator.mediaSession.setPositionState({
      duration,
      position: Math.min(currentTime, duration),
      playbackRate: 1,
    });
  }, [currentTime, duration]);
}
