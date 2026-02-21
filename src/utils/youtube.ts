export function extractVideoId(url: string): string | null {
  const trimmed = url.trim();

  // Handle plain video IDs (11 chars, alphanumeric + - _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return id.length === 11 ? id : null;
    }

    // youtube.com/watch?v=VIDEO_ID
    if (parsed.hostname.includes('youtube.com')) {
      // Shorts: youtube.com/shorts/VIDEO_ID
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/shorts/')[1]?.split('/')[0];
        return id?.length === 11 ? id : null;
      }

      // Embed: youtube.com/embed/VIDEO_ID
      if (parsed.pathname.startsWith('/embed/')) {
        const id = parsed.pathname.split('/embed/')[1]?.split('/')[0];
        return id?.length === 11 ? id : null;
      }

      // Standard watch URL
      const v = parsed.searchParams.get('v');
      return v?.length === 11 ? v : null;
    }
  } catch {
    // Not a valid URL
  }

  return null;
}

export interface VideoMeta {
  title: string;
  thumbnail: string;
  author: string;
}

export async function fetchVideoMeta(videoId: string): Promise<VideoMeta> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

  const res = await fetch(oembedUrl);
  if (!res.ok) throw new Error('Failed to fetch video metadata');

  const data = await res.json();
  return {
    title: data.title ?? 'Unknown Title',
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    author: data.author_name ?? 'Unknown Channel',
  };
}

export function buildEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&autoplay=1`;
}
