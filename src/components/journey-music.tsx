'use client';

import {useEffect, useId, useRef, useState} from 'react';

export function JourneyMusic() {
  const audio = useRef<HTMLAudioElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinned = useRef(false);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(6);
  const [error, setError] = useState('');

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    player.volume = .06;
    const pauseWhenHidden = () => { if (document.hidden) player.pause(); };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      player.pause();
    };
  }, []);

  function closePanel() {
    pinned.current = false;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (!container.current?.contains(event.target as Node)) closePanel();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { closePanel(); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('click', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('click', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

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

  return <div ref={container} className="journey-music" data-playing={playing}
    onPointerEnter={event => { if (event.pointerType === 'mouse') { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true); } }}
    onPointerLeave={event => { if (event.pointerType === 'mouse') closeTimer.current = setTimeout(() => {
      if (!pinned.current && !container.current?.contains(document.activeElement)) setOpen(false);
    }, 180); }}
    onBlur={event => { if (!pinned.current && !event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    <audio ref={audio} src="/audio/purrple-cat-just-relax.mp3" preload="none" loop
      onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setPlaying(false); setLoading(false); setError('Music couldn’t load. Please try again.'); }}/>
    <button ref={trigger} type="button" className="journey-music-trigger" aria-label="Music settings" aria-expanded={open} aria-controls={panelId} aria-haspopup="dialog"
      onClick={() => { if (pinned.current) closePanel(); else { pinned.current = true; setOpen(true); } }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="18" cy="16" rx="3" ry="2.5"/></svg>
      {playing && <span className="journey-music-playing-dot" aria-hidden="true"/>}
    </button>
    <div id={panelId} className="journey-music-panel" role="dialog" aria-label="Music for the journey" hidden={!open}>
      <div className="journey-music-heading"><span>A little lo-fi</span><button type="button" className="journey-music-close" onClick={() => { closePanel(); trigger.current?.focus(); }} aria-label="Close music settings">×</button></div>
    <div className="journey-music-row">
      <button className="journey-music-play" type="button" onClick={toggle} disabled={loading}
        aria-label={loading ? 'Loading lo-fi music' : playing ? 'Pause lo-fi music' : 'Play lo-fi music'} aria-pressed={playing}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          {playing ? <path d="M6 4h4v16H6zm8 0h4v16h-4Z"/> : <path d="M7 4.5 20 12 7 19.5Z"/>}
        </svg>
      </button>
      <div className="journey-music-copy"><span className="journey-music-title">Just Relax</span><span className="journey-music-subtitle">Purrple Cat</span><span className="journey-music-status" role="status">{loading ? 'Loading…' : playing ? 'Playing softly' : 'Press play. Take your time.'}</span></div>
    </div>
    <div className="journey-music-volume"><label htmlFor="journey-volume">Volume <span>{volume}%</span></label><input id="journey-volume" aria-label="Music volume" type="range" min="0" max="100" step="1" value={volume} onChange={event => { const value = Number(event.target.value); setVolume(value); if (audio.current) audio.current.volume = value / 100; }}/></div>
    {error && <p className="journey-music-error" role="alert">{error}</p>}
    <p className="journey-music-credit">“Just Relax” by <a href="https://purrplecat.itch.io/just-relax" target="_blank" rel="noopener noreferrer">Purrple Cat<span className="sr-only"> (opens in a new tab)</span></a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0<span className="sr-only"> (opens in a new tab)</span></a></p>
    </div>
  </div>;
}
