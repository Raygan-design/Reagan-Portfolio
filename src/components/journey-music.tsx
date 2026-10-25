'use client';

import {useEffect, useId, useRef, useState} from 'react';

export function JourneyMusic() {
  const audio = useRef<HTMLAudioElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userControlledPlayback = useRef(false);
  const restoringFocus = useRef(false);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(3);
  const [error, setError] = useState('');

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    // Set the quiet level before requesting playback, including on browsers
    // that already allow audible autoplay for this site.
    player.volume = .03;
    const stopWaitingForGesture = () => {
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
    };
    function startOnInteraction(event: Event) {
      if (userControlledPlayback.current || document.hidden || container.current?.contains(event.target as Node)) return;
      if (event instanceof KeyboardEvent && (event.repeat || !['Enter', ' '].includes(event.key))) return;
      void player!.play().catch(() => { /* The play button remains available. */ });
    }
    document.addEventListener('click', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);
    // Successful playback removes the fallback, so a later deliberate pause
    // is never undone by another click elsewhere on the page.
    player.addEventListener('playing', stopWaitingForGesture);
    if (!document.hidden) void player.play().catch(() => { /* Wait for a browser-approved interaction. */ });
    const pauseWhenHidden = () => { if (document.hidden) player.pause(); };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      stopWaitingForGesture();
      player.removeEventListener('playing', stopWaitingForGesture);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      player.pause();
    };
  }, []);

  function closePanel() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(false);
  }

  function dismissPanel() {
    closePanel();
    restoringFocus.current = true;
    trigger.current?.focus({preventScroll: true});
    restoringFocus.current = false;
  }

  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (!container.current?.contains(event.target as Node)) closePanel();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismissPanel();
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
    userControlledPlayback.current = true;
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
      setOpen(false);
    }, 180); }}
    onFocus={() => { if (closeTimer.current) clearTimeout(closeTimer.current); if (!restoringFocus.current) setOpen(true); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closePanel(); }}>
    <audio ref={audio} src="/audio/purrple-cat-just-relax.mp3" preload="none" loop
      onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setPlaying(false); setLoading(false); setError('Music couldn’t load. Please try again.'); }}/>
    <button ref={trigger} type="button" className="journey-music-trigger" disabled={loading}
      aria-label={loading ? 'Loading music' : playing ? 'Pause music' : 'Play music'} aria-pressed={playing}
      aria-expanded={open} aria-controls={panelId} aria-haspopup="dialog" onClick={toggle}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {playing ? <path d="M6 4h4v16H6zm8 0h4v16h-4Z"/> : <path d="M8 5 19 12 8 19Z"/>}
      </svg>
    </button>
    <div id={panelId} className="journey-music-panel" role="dialog" aria-label="Music for the journey" hidden={!open}>
      <div className="journey-music-heading"><span>A little lo-fi</span><button type="button" className="journey-music-close" onClick={dismissPanel} aria-label="Close music settings">×</button></div>
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
