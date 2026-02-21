import type { PlayerState } from '../hooks/useYouTubePlayer';

interface PlayerControlsProps {
  playerState: PlayerState;
  currentTime: number;
  duration: number;
  volume: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (seconds: number) => void;
  onVolume: (volume: number) => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PlayerControls({
  playerState,
  currentTime,
  duration,
  volume,
  onPlay,
  onPause,
  onSeek,
  onVolume,
}: PlayerControlsProps) {
  const isPlaying = playerState === 'playing' || playerState === 'buffering';

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolume(Number(e.target.value));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-controls">
      <div className="seek-row">
        <input
          type="range"
          className="seek-slider"
          min={0}
          max={duration || 100}
          value={currentTime}
          step={1}
          onChange={handleSeek}
          style={{ '--progress': `${progress}%` } as React.CSSProperties}
        />
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="controls-row">
        <div className="volume-row">
          <span className="volume-icon" aria-label="Volume">
            {volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
          </span>
          <input
            type="range"
            className="volume-slider"
            min={0}
            max={100}
            value={volume}
            onChange={handleVolume}
          />
        </div>

        <button
          className="btn-play-pause"
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

        <div className="volume-spacer" />
      </div>
    </div>
  );
}
