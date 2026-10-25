'use client';

import {useEffect, useRef, useState} from 'react';

export function JourneyMusic() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(25);
  const [error, setError] = useState('');

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    player.volume = .25;
    const pauseWhenHidden = () => { if (document.hidden) player.pause(); };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      player.pause();
    };
  }, []);

  async function toggle() {
    const player = audio.current;
    if (!player || loading) return;
    if (!player.paused) { player.pause(); return; }
    setError('');
    setLoading(true);
    try {
      if (player.error) player.load();
      await player.play();
    } catch {
      setError('Music couldn’t start. Please try again.');
    } finally { setLoading(false); }
  }

  return <div className="journey-music" data-playing={playing}>
    <audio ref={audio} src="/audio/purrple-cat-just-relax.mp3" preload="none" loop
      onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setPlaying(false); setLoading(false); setError('Music couldn’t load. Please try again.'); }}/>
    <div className="journey-music-row">
      <button className="journey-music-play" type="button" onClick={toggle} disabled={loading}
        aria-label={loading ? 'Loading lo-fi music' : playing ? 'Pause lo-fi music' : 'Play lo-fi music'} aria-pressed={playing}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          {playing ? <path d="M6 4h4v16H6zm8 0h4v16h-4Z"/> : <path d="M7 4.5 20 12 7 19.5Z"/>}
        </svg>
      </button>
      <div className="journey-music-copy"><span className="journey-music-title">A little lo-fi for the journey</span><span className="journey-music-subtitle" aria-live="polite">{loading ? 'Getting the music ready…' : playing ? 'Just Relax · Purrple Cat' : 'Press play. Take your time.'}</span></div>
      <div className="journey-music-volume"><label htmlFor="journey-volume">Volume</label><input id="journey-volume" aria-label="Music volume" type="range" min="0" max="100" step="1" value={volume} onChange={event => { const value = Number(event.target.value); setVolume(value); if (audio.current) audio.current.volume = value / 100; }}/></div>
    </div>
    {error && <p className="journey-music-error" role="alert">{error}</p>}
    <p className="journey-music-credit">“Just Relax” by <a href="https://purrplecat.itch.io/just-relax" target="_blank" rel="noopener noreferrer">Purrple Cat<span className="sr-only"> (opens in a new tab)</span></a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0<span className="sr-only"> (opens in a new tab)</span></a></p>
  </div>;
}
