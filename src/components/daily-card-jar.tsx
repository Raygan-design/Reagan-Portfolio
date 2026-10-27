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

const read = () => { try { return localStorage.getItem(storageKey); } catch { return null; } };
const write = (value: string) => { try { localStorage.setItem(storageKey, value); } catch {} };
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = []; let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > width && line) { lines.push(line); line = word; } else line = next;
  }
  return line ? [...lines, line] : lines;
}

// Draws the card as a 1080×1350 portrait image, the size Instagram and WhatsApp handle best.
async function renderCard({message, label}: Today) {
  await Promise.all([document.fonts.load("72px 'Oooh Baby'"), document.fonts.load("700 28px 'Bricolage Grotesque Variable'")]);
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f2efff'; ctx.fillRect(0, 0, 1080, 1350);
  ctx.save(); ctx.translate(540, 675); ctx.rotate(-0.012);
  ctx.shadowColor = '#21153b22'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#fffdf7'; ctx.fillRect(-430, -560, 860, 1120);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#e8e2d2'; ctx.lineWidth = 2;
  for (let y = -330; y < 470; y += 74) { ctx.beginPath(); ctx.moveTo(-370, y); ctx.lineTo(370, y); ctx.stroke(); }
  ctx.fillStyle = '#000047'; ctx.textAlign = 'center';
  ctx.font = "700 26px 'Bricolage Grotesque Variable'"; ctx.letterSpacing = '4px';
  ctx.fillText(`YOUR CARD FOR ${label.toUpperCase()}`, 0, -440);
  ctx.letterSpacing = '0px';
  let size = 84; ctx.font = `${size}px 'Oooh Baby'`; let lines = wrap(ctx, message, 700);
  while (lines.length > 6 && size > 52) { size -= 6; ctx.font = `${size}px 'Oooh Baby'`; lines = wrap(ctx, message, 700); }
  const lineHeight = size * 1.25, top = -lineHeight * (lines.length - 1) / 2 - 20;
  lines.forEach((text, i) => ctx.fillText(text, 0, top + i * lineHeight));
  ctx.font = "64px 'Oooh Baby'"; ctx.fillStyle = '#6852ae'; ctx.fillText('— Raygan', 120, 400);
  ctx.restore();
  ctx.fillStyle = '#000047'; ctx.textAlign = 'center'; ctx.font = "700 24px 'Bricolage Grotesque Variable'"; ctx.letterSpacing = '3px';
  ctx.fillText('RAYGAN.  ·  PICK YOUR CARD AT REAGANMARFO.COM', 540, 1300);
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not create image')), 'image/png'));
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Jar({rising}: {rising: boolean}) {
  return <svg viewBox="0 0 64 64" className="card-jar-art" aria-hidden="true">
    <g className={rising ? 'card-jar-note rising' : 'card-jar-note'}><path d="M26 30 L38 28.5 L39 37 L27 38.5 Z" fill="#fffdf7" stroke="#000047" strokeWidth="1.3" strokeLinejoin="round"/><path d="M27 33.5 L38.5 32" stroke="#ad93ff" strokeWidth="1.1"/></g>
    <path d="M20.2 18.4 C19.4 22.6 14.6 24.4 13.8 30.2 L13.4 51.6 C13.2 55.8 16.1 58.3 20.4 58.1 L43.8 58.4 C48.2 58.2 50.9 55.6 50.7 51.2 L50.2 30.4 C49.6 24.2 44.9 22.4 43.9 18.2" fill="#fbfaff" stroke="#000047" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 44 L27 41.5 L28.5 49 L18 51 Z" fill="#ad93ff" stroke="#000047" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M30 45.5 L42 44 L43 52.5 L31 53.5 Z" fill="#ffe7a8" stroke="#000047" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M36 37 L46 39 L44.5 46 L34.6 44.4 Z" fill="#f2efff" stroke="#000047" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M19.5 39.5 C18.2 34 19.6 28.6 22.8 26" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17.6 10.6 C26.1 9.7 38.2 9.9 46.5 10.5 L46.1 18 C37.1 18.6 27 18.4 17.9 17.7 Z" fill="#ad93ff" stroke="#000047" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M21 13.8 C28 13.2 36 13.3 43 13.9" fill="none" stroke="#000047" strokeWidth="1" strokeLinecap="round" opacity=".45"/>
  </svg>;
}

export function DailyCardJar() {
  const [card, setCard] = useState<Today | null>(null);
  const [opened, setOpened] = useState(true);
  const [phase, setPhase] = useState<'idle' | 'opening' | 'open'>('idle');
  const [busy, setBusy] = useState<'share' | 'download' | null>(null);
  const [notice, setNotice] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => { const t = today(); setCard(t); setOpened(read() === t.key); }, []);

  function open() {
    if (!card || phase !== 'idle') return;
    setPhase('opening'); setNotice('');
    setTimeout(() => { dialog.current?.showModal(); setPhase('open'); write(card.key); setOpened(true); }, reducedMotion() ? 0 : 750);
  }

  async function share() {
    if (!card) return; setBusy('share'); setNotice('');
    try {
      const blob = await renderCard(card), file = new File([blob], `raygan-card-${card.key}.png`, {type: 'image/png'});
      const text = `${card.message} — Raygan`;
      if (navigator.canShare?.({files: [file]})) await navigator.share({files: [file], title: 'My card from Raygan', text});
      else if (navigator.share) await navigator.share({title: 'My card from Raygan', text, url: location.origin});
      else { download(blob, file.name); setNotice('Sharing isn’t available here, so we saved the image instead.'); }
    } catch (e) { if ((e as Error).name !== 'AbortError') setNotice('Something went wrong. Try downloading the image instead.'); }
    setBusy(null);
  }

  async function save() {
    if (!card) return; setBusy('download'); setNotice('');
    try { download(await renderCard(card), `raygan-card-${card.key}.png`); setNotice('Saved. Look for it in your downloads.'); }
    catch { setNotice('Something went wrong while saving the image.'); }
    setBusy(null);
  }

  return <>
    <button type="button" className={`card-jar${opened ? '' : ' fresh'}${phase === 'opening' ? ' opening' : ''}`} onClick={open} aria-haspopup="dialog" aria-label={opened ? 'Read today’s card again' : 'Pick today’s card'}>
      <span className="card-jar-icon"><Jar rising={phase === 'opening'}/>{!opened && <span className="card-jar-dot" aria-hidden="true"/>}</span>
      <span className="card-jar-copy"><span className="card-jar-title">{opened ? 'Today’s card' : 'Pick today’s card'}</span><span className="card-jar-caption">{opened ? 'A new one tomorrow' : 'A note for your journey'}</span></span>
    </button>
    <dialog ref={dialog} className="card-dialog" aria-labelledby="card-dialog-message" onClose={() => setPhase('idle')} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }} data-lenis-prevent>
      {card && <div className="card-dialog-inner">
        <article className="card-paper">
          <p className="eyebrow">Your card for {card.label}</p>
          <p id="card-dialog-message" className="card-message">{card.message}</p>
          <p className="card-signature">— Raygan</p>
        </article>
        <div className="card-dialog-actions">
          <button type="button" className="button primary" onClick={share} disabled={!!busy}>{busy === 'share' ? 'PREPARING…' : 'SHARE'}</button>
          <button type="button" className="button" onClick={save} disabled={!!busy}>{busy === 'download' ? 'SAVING…' : 'DOWNLOAD IMAGE'}</button>
          <button type="button" className="text-button" onClick={() => dialog.current?.close()}>CLOSE</button>
        </div>
        <p className="card-dialog-note" role="status">{notice || 'A new card is waiting for you tomorrow.'}</p>
      </div>}
    </dialog>
  </>;
}
