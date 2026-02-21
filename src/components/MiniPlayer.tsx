import type { VideoMeta } from '../utils/youtube';
import type { PlayerState } from '../hooks/useYouTubePlayer';

interface MiniPlayerProps {
  meta: VideoMeta;
  playerState: PlayerState;
  onPlay: () => void;
  onPause: () => void;
  onExpand: () => void;
}

export function MiniPlayer({ meta, playerState, onPlay, onPause, onExpand }: MiniPlayerProps) {
  const isPlaying = playerState === 'playing' || playerState === 'buffering';

  return (
    <div className="mini-player" role="region" aria-label="Mini player">
      <button className="mini-expand" onClick={onExpand} aria-label="Expand player">
        <img src={meta.thumbnail} alt="" className="mini-thumb" />
        <span className="mini-title">{meta.title}</span>
      </button>

      <button
        className="mini-play-pause"
        onClick={isPlaying ? onPause : onPlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {playerState === 'buffering' ? (
          <span className="spinner" />
        ) : isPlaying ? (
          '⏸'
        ) : (
          '▶'
        )}
      </button>
    </div>
  );
}
