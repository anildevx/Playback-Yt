import type { VideoMeta } from '../utils/youtube';

interface VideoInfoProps {
  videoId: string;
  meta: VideoMeta;
}

export function VideoInfo({ videoId, meta }: VideoInfoProps) {
  return (
    <div className="video-info">
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="video-thumbnail-link"
      >
        <img
          src={meta.thumbnail}
          alt={meta.title}
          className="video-thumbnail"
        />
        <span className="video-thumbnail-overlay">▶ YouTube</span>
      </a>
      <div className="video-details">
        <h2 className="video-title">{meta.title}</h2>
        <p className="video-author">{meta.author}</p>
      </div>
    </div>
  );
}
