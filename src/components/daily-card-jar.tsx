'use client';

import {useEffect, useRef, useState} from 'react';
import cards from '@/content/daily-cards.json';

const storageKey = 'raygan-daily-card';

// Everyone gets the same card on the same local day; it changes at midnight.
function today() {
  const now = new Date();
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5);
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const label = now.toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'long'});
  return {key, label, message: cards[day % cards.length]};
}
type Today = ReturnType<typeof today>;
type Phase = 'idle' | 'opening' | 'open' | 'closing';

const read = () => { try { return localStorage.getItem(storageKey); } catch { return null; } };
const write = (value: string) => { try { localStorage.setItem(storageKey, value); } catch {} };
const motion = (ms: number) => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = []; let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > width && line) { lines.push(line); line = word; } else line = next;
  }
  return line ? [...lines, line] : lines;
}

// Wobbly rectangle so the shared image matches the hand-drawn card on screen.
function sketchRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: number) {
  const j = (n: number) => Math.sin(seed * 12.9898 + n * 78.233) * 5;
  ctx.beginPath(); ctx.moveTo(x + j(1), y + j(2));
  ctx.quadraticCurveTo(x + w / 2, y + j(3) - 4, x + w + j(4), y + j(5));
  ctx.quadraticCurveTo(x + w + j(6) + 4, y + h / 2, x + w + j(7), y + h + j(8));
  ctx.quadraticCurveTo(x + w / 2, y + h + j(9) + 4, x + j(10), y + h + j(11));
  ctx.quadraticCurveTo(x + j(12) - 4, y + h / 2, x + j(1), y + j(2));
}

// Draws the card as a 1080×1350 portrait image, the size Instagram and WhatsApp handle best.
async function renderCard({message, label}: Today) {
  await Promise.all([document.fonts.load("72px 'Oooh Baby'"), document.fonts.load("700 28px 'Bricolage Grotesque Variable'")]);
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f2efff'; ctx.fillRect(0, 0, 1080, 1350);
  ctx.save(); ctx.translate(540, 650); ctx.rotate(-0.02);
  ctx.shadowColor = '#21153b22'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#fffdf7'; sketchRect(ctx, -420, -520, 840, 1040, 1); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#000047'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
  sketchRect(ctx, -420, -520, 840, 1040, 1); ctx.stroke();
  ctx.lineWidth = 2; ctx.globalAlpha = .45; sketchRect(ctx, -412, -512, 828, 1026, 2); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#000047'; ctx.textAlign = 'center';
  ctx.font = "700 26px 'Bricolage Grotesque Variable'"; ctx.letterSpacing = '4px';
  ctx.fillText(`YOUR CARD FOR ${label.toUpperCase()}`, 0, -420);
  ctx.letterSpacing = '0px';
  let size = 88; ctx.font = `${size}px 'Oooh Baby'`; let lines = wrap(ctx, message, 680);
  while (lines.length > 6 && size > 52) { size -= 6; ctx.font = `${size}px 'Oooh Baby'`; lines = wrap(ctx, message, 680); }
  const lineHeight = size * 1.25, top = -lineHeight * (lines.length - 1) / 2 - 10;
  lines.forEach((text, i) => ctx.fillText(text, 0, top + i * lineHeight));
  ctx.font = "64px 'Oooh Baby'"; ctx.fillStyle = '#6852ae'; ctx.fillText('— Raygan', 140, 410);
  ctx.restore();
  ctx.fillStyle = '#000047'; ctx.textAlign = 'center'; ctx.font = "700 24px 'Bricolage Grotesque Variable'"; ctx.letterSpacing = '3px';
  ctx.fillText('RAYGAN.  ·  PICK YOUR CARD AT REAGANMARFO.COM', 540, 1290);
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not create image')), 'image/png'));
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Jar() {
  const ink = {stroke: '#000047', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return <svg viewBox="0 0 120 140" className="card-jar-art" aria-hidden="true">
    <ellipse cx="60" cy="133" rx="38" ry="4.5" fill="#21153b" opacity=".12"/>
    <g className="card-jar-body">
      <path d="M33 34 C31.5 42 21 46 19.5 58 L18.6 116 C18.4 125 24 130 33 130.3 L87.5 130.6 C96.5 130.4 101.6 125 101.4 116.2 L100.6 58.6 C99.4 46.4 89 42.4 87.4 33.6" fill="#fbfaff" strokeWidth="2.4" {...ink}/>
      <path d="M34.6 36.5 C34 41.8 24.4 46.6 23 57.4 M86.2 36.2 C87 41.6 96.4 46 97.6 57" fill="none" strokeWidth="1.2" opacity=".35" {...ink}/>
      <path d="M27 100 L48 94.5 L51.4 110.5 L30 115.6 Z" fill="#ad93ff" strokeWidth="1.8" {...ink}/>
      <path d="M30.4 104.6 L49 99.6" fill="none" strokeWidth="1" opacity=".5" {...ink}/>
      <path d="M53 103.5 L78 101 L79.6 119 L54.6 120.6 Z" fill="#ffe7a8" strokeWidth="1.8" {...ink}/>
      <path d="M66 84 L89 88.5 L86 104 L63.4 100 Z" fill="#f2efff" strokeWidth="1.8" {...ink}/>
      <path d="M32 82 L54 78.6 L56.4 93 L34 96 Z" fill="#ffd3c4" strokeWidth="1.8" {...ink}/>
      <path d="M46 66 L66 62.4 L68.6 77 L48 80 Z" fill="#fffdf7" strokeWidth="1.8" {...ink}/>
      <path d="M49 71.4 L66.6 68.4" fill="none" stroke="#ad93ff" strokeWidth="1.4"/>
      <path d="M28.6 92 C26 78 27.4 64 33.6 55.6" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
      <path d="M28.2 100 L28 104" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
    </g>
    <g className="card-jar-lid">
      <path d="M29.6 18.4 C46 16.6 74 16.8 90.6 18.6 L90 34.4 C73.6 35.6 47 35.4 30 34 Z" fill="#ad93ff" strokeWidth="2.4" {...ink}/>
      <path d="M34 23.6 C50 22.6 70 22.8 86.4 24 M33.8 29 C50 28.2 70 28.4 86.4 29.6" fill="none" strokeWidth="1.2" opacity=".45" {...ink}/>
      <path d="M52 18 C51 11 69 11 68.4 18" fill="none" strokeWidth="2.2" {...ink}/>
    </g>
  </svg>;
}

export function DailyCardJar() {
  const [card, setCard] = useState<Today | null>(null);
  const [opened, setOpened] = useState(true);
  const [phase, setPhase] = useState<Phase>('idle');
  const [busy, setBusy] = useState<'share' | 'download' | null>(null);
  const [notice, setNotice] = useState('');
  const root = useRef<HTMLDivElement>(null), jar = useRef<HTMLButtonElement>(null), closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => { const t = today(); setCard(t); setOpened(read() === t.key); }, []);

  function open() {
    if (!card || phase !== 'idle') return;
    setPhase('opening'); setNotice(''); write(card.key);
    setTimeout(() => { setPhase('open'); setOpened(true); closeButton.current?.focus({preventScroll: true}); }, motion(550));
  }
  function close(returnFocus = true) {
    setPhase(p => p === 'open' ? 'closing' : p);
    setTimeout(() => { setPhase('idle'); if (returnFocus) jar.current?.focus({preventScroll: true}); }, motion(380));
  }

  useEffect(() => {
    if (phase !== 'open') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const onPointer = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) close(false); };
    document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); };
  }, [phase]);

  async function share() {
    if (!card) return; setBusy('share'); setNotice('');
    try {
      const blob = await renderCard(card), file = new File([blob], `raygan-card-${card.key}.png`, {type: 'image/png'});
      const text = `${card.message} — Raygan`;
      if (navigator.canShare?.({files: [file]})) await navigator.share({files: [file], title: 'My card from Raygan', text});
      else if (navigator.share) await navigator.share({title: 'My card from Raygan', text, url: location.origin});
      else { download(blob, file.name); setNotice('Saved the image so you can share it.'); }
    } catch (e) { if ((e as Error).name !== 'AbortError') setNotice('Couldn’t share. Try downloading instead.'); }
    setBusy(null);
  }

  async function save() {
    if (!card) return; setBusy('download'); setNotice('');
    try { download(await renderCard(card), `raygan-card-${card.key}.png`); setNotice('Saved to your downloads.'); }
    catch { setNotice('Couldn’t save the image.'); }
    setBusy(null);
  }

  const showCard = phase === 'open' || phase === 'closing';
  return <div ref={root} className={`card-jar-wrap ${phase}${opened ? '' : ' fresh'}`}>
    {card && showCard && <section className="card-pop" role="dialog" aria-label={`Your card for ${card.label}`}>
      <button ref={closeButton} type="button" className="card-pop-close" onClick={() => close()} aria-label="Put the card back">×</button>
      <p className="card-pop-date">Your card for {card.label}</p>
      <p className="card-pop-message">{card.message}</p>
      <p className="card-pop-signature">— Raygan</p>
      <div className="card-pop-actions">
        <button type="button" onClick={share} disabled={!!busy}>{busy === 'share' ? 'Preparing…' : 'Share'}</button>
        <button type="button" onClick={save} disabled={!!busy}>{busy === 'download' ? 'Saving…' : 'Download'}</button>
      </div>
      <p className="card-pop-note" role="status">{notice || 'A new card waits for you tomorrow.'}</p>
    </section>}
    <button ref={jar} type="button" className="card-jar" onClick={() => phase === 'open' ? close() : open()} aria-expanded={showCard} aria-label={opened ? 'Read today’s card again' : 'Open the jar for today’s card'}>
      <Jar/>
      <span className="card-jar-hint" aria-hidden="true">{opened ? 'today’s card' : 'tap to open'}</span>
    </button>
  </div>;
}
