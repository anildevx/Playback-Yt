import { useState, useRef } from 'react';
import { extractVideoId } from '../utils/youtube';

interface LinkInputProps {
  onVideoId: (id: string) => void;
}

export function LinkInput({ onVideoId }: LinkInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(value);
    if (id) {
      setError('');
      onVideoId(id);
    } else {
      setError('Invalid YouTube URL. Try a youtube.com/watch or youtu.be link.');
    }
  };

  const handleFocus = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && !value) {
        const id = extractVideoId(text);
        if (id) {
          setValue(text);
          setError('');
        }
      }
    } catch {
      // Clipboard permission denied — ignore
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (error) setError('');
  };

  return (
    <form className="link-input-form" onSubmit={handleSubmit}>
      <div className="link-input-row">
        <input
          ref={inputRef}
          type="text"
          className="link-input"
          placeholder="Paste a YouTube URL…"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="btn-play-url" aria-label="Play">
          ▶
        </button>
      </div>
      {error && <p className="link-input-error">{error}</p>}
    </form>
  );
}
