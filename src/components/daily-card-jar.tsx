'use client';

import {useEffect, useRef, useState} from 'react';
import cards from '@/content/daily-cards.json';

const storageKey = 'raygan-daily-card';

// Each day's card is one of the jar's note colours. The same colour is used for the note
// that leaves the jar, the card it grows into, and the downloaded image.
// Light, sticky-note shades so the dark handwriting stands out.
// Sticky-note colours: the card is the light shade, the shadow is the full colour (or, for
// orange, yellow and peach, the dark ink, which suits those warm shades better), and the
// ink (main text) and soft ink (signature, small print) are dark shades of the same colour.
const purple = {paper: '#e6ddff', shadow: '#ad93ff', ink: '#2a1d6e', soft: '#4b3c8c'};
const pink = {paper: '#ffdcec', shadow: '#ff5aa8', ink: '#6b1240', soft: '#a01f5c'};
const orange = {paper: '#ffe2c8', shadow: '#5a2a0c', ink: '#5a2a0c', soft: '#8f3f0c'};
const yellow = {paper: '#fff4b5', shadow: '#463a05', ink: '#463a05', soft: '#6e5a08'};
const green = {paper: '#e3f7c9', shadow: '#86d13b', ink: '#22410b', soft: '#3a6614'};
const blue = {paper: '#d8eeff', shadow: '#2ea6f0', ink: '#0b3557', soft: '#195a8c'};
const peach = {paper: '#ffe0d6', shadow: '#5c2014', ink: '#5c2014', soft: '#923523'};
// Purple is the brand colour, so it comes up more often than the others (3 in 9).
const tones = [purple, pink, orange, purple, yellow, green, purple, blue, peach];
type Tone = typeof tones[number];

// Each visitor has their own shuffled order of the cards, so two people rarely see the same
// card on the same day. A visitor keeps one card all day (it changes at midnight) and goes
// through every card before any repeats.
const seedKey = 'raygan-card-seed';
function visitorSeed() {
  try {
    const saved = Number(localStorage.getItem(seedKey));
    if (saved) return saved;
    const seed = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
    localStorage.setItem(seedKey, String(seed));
    return seed;
  } catch { return Math.floor(Math.random() * 2 ** 32) || 1; }
}
function shuffled(count: number, seed: number) {
  let a = seed >>> 0;
  const random = () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32; };
  const order = [...Array(count).keys()];
  for (let i = count - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return order;
}
// A card is either Reagan's own words (plain text) or a quote: {"text": "…", "by": "Author Name"}.
type Card = string | {text: string; by: string};
function today() {
  const now = new Date(), seed = visitorSeed();
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5);
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const label = now.toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'long'});
  const entry = (cards as Card[])[shuffled(cards.length, seed)[day % cards.length]];
  const [message, by] = typeof entry === 'string' ? [entry, 'Reagan'] : [entry.text, entry.by];
  return {key, label, message, by, tone: tones[(day + seed) % tones.length]};
}
type Today = ReturnType<typeof today>;
type Phase = 'idle' | 'opening' | 'open' | 'closing';

const read = () => { try { return localStorage.getItem(storageKey); } catch { return null; } };
const write = (value: string) => { try { localStorage.setItem(storageKey, value); } catch {} };
function untilTomorrow() {
  const now = new Date(), midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const minutes = Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 6e4)), h = Math.floor(minutes / 60), m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
// Synthesised to follow the animation beat by beat (no audio file to load).
// Opening: lid pops, glass rattles with each swing, the note flicks out of the jar,
// paper whooshes as it grows into the card, then a chime as it lands.
// Closing: the reverse whoosh as the card folds up, then a soft plop into the jar.
const shakeMs = 550, riseMs = 950, returnMs = 750;
function sound(play: (ctx: AudioContext, t: number, tone: Beep, whoosh: Whoosh) => number) {
  try {
    const ctx = new AudioContext(), t = ctx.currentTime + .02, out = ctx.createGain();
    out.gain.value = .55; out.connect(ctx.destination);
    const tone: Beep = (type, from, to, at, length, level) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(from, at); osc.frequency.exponentialRampToValueAtTime(to, at + length);
      gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(level, at + .005); gain.gain.exponentialRampToValueAtTime(.001, at + length);
      osc.connect(gain).connect(out); osc.start(at); osc.stop(at + length + .02);
    };
    const whoosh: Whoosh = (at, length, from, to, level) => {
      const noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate), data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(), band = ctx.createBiquadFilter(), gain = ctx.createGain();
      src.buffer = noise; band.type = 'bandpass'; band.Q.value = 1.2;
      band.frequency.setValueAtTime(from, at); band.frequency.exponentialRampToValueAtTime(to, at + length);
      gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(level, at + length * .45); gain.gain.exponentialRampToValueAtTime(.001, at + length);
      src.connect(band).connect(gain).connect(out); src.start(at); src.stop(at + length);
    };
    const end = play(ctx, t, tone, whoosh);
    setTimeout(() => ctx.close(), (end + 1.2) * 1000);
  } catch {}
}
type Beep = (type: OscillatorType, from: number, to: number, at: number, length: number, level: number) => void;
type Whoosh = (at: number, length: number, from: number, to: number, level: number) => void;
const playOpenSound = (animated: boolean) => sound((_, t, tone, whoosh) => {
  const shake = shakeMs / 1000, rise = riseMs / 1000, land = animated ? shake + rise * .97 : 0;
  if (animated) {
    tone('sine', 760, 240, t, .09, .45); // lid pops
    [.125, .25, .375, .5].forEach((at, i) => tone('triangle', 2600 - i * 180, 2000, t + at * shake, .05, .12 - i * .02)); // glass rattle
    tone('triangle', 1500, 2900, t + shake, .07, .14); // note flicks out of the jar
    whoosh(t + shake + rise * .4, rise * .6, 900, 4200, .24); // grows into the card
  }
  tone('sine', 1046.5, 1046.5, t + land, .7, .16); // chime as it lands
  tone('sine', 1568, 1568, t + land + .11, .8, .13);
  return land + 1;
});
const playCloseSound = () => sound((_, t, tone, whoosh) => {
  const back = returnMs / 1000;
  whoosh(t, back * .55, 4000, 900, .2); // folds back into a note
  tone('triangle', 2400, 1400, t + back * .75, .06, .1); // slips past the lid
  tone('sine', 420, 120, t + back, .14, .4); // plop into the jar
  tone('triangle', 2300, 2000, t + back + .03, .05, .07);
  return back + .3;
});
const motion = (ms: number) => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = []; let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > width && line) { lines.push(line); line = word; } else line = next;
  }
  return line ? [...lines, line] : lines;
}

// Draws what the visitor sees, at 1080×1350 (the size Instagram and WhatsApp handle best):
// the sketch card with its purple offset shadow, sitting above the jar.
async function renderCard({message, by, label, tone}: Today) {
  await Promise.all([document.fonts.load("72px 'Oooh Baby'"), document.fonts.load("700 28px 'Bricolage Grotesque Variable'"), document.fonts.load("400 28px 'Bricolage Grotesque Variable'")]);
  const W = 1080, H = 1350, s = 2.6875, cardW = 320 * s, pad = 24 * s, canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f2efff'; ctx.fillRect(0, 0, W, H);

  const jarW = 84 * s, jarH = 98 * s, jarX = 100, jarBottom = H - 50, cardX = jarX + 4 * s, cardBottom = jarBottom - 122 * s;
  const date = () => { ctx.font = `700 ${11 * s}px 'Bricolage Grotesque Variable'`; ctx.letterSpacing = `${1.32 * s}px`; };
  date(); const dateLines = wrap(ctx, `YOUR CARD FOR ${label.toUpperCase()}`, cardW - pad * 2 - 30 * s);
  let size = 31 * s, lines: string[] = [], cardH = 0;
  do {
    ctx.letterSpacing = '0px'; ctx.font = `${size}px 'Oooh Baby'`; lines = wrap(ctx, message, cardW - pad * 2);
    cardH = 26 * s + dateLines.length * 16 * s + 14 * s + lines.length * size * 1.25 + 8 * s + 39 * s + 14 * s + 18 * s + 24 * s;
    size -= 2 * s;
  } while (cardBottom - cardH < 50 && size > 18 * s);
  size += 2 * s;
  ctx.translate(0, -Math.max(0, (cardBottom - cardH - (H - jarBottom)) / 2)); // centre the card and jar vertically

  ctx.save(); ctx.translate(cardX, cardBottom); ctx.rotate(-1.5 * Math.PI / 180);
  const outer = [{x: 255 * s, y: 15 * s}, {x: 15 * s, y: 225 * s}, {x: 225 * s, y: 15 * s}, {x: 15 * s, y: 255 * s}];
  const inner = [{x: 15 * s, y: 255 * s}, {x: 225 * s, y: 15 * s}, {x: 15 * s, y: 225 * s}, {x: 255 * s, y: 15 * s}];
  ctx.shadowColor = '#21153b22'; ctx.shadowBlur = 40 * s; ctx.shadowOffsetY = 18 * s;
  ctx.fillStyle = tone.shadow; ctx.beginPath(); ctx.roundRect(4 * s, -cardH + 6 * s, cardW, cardH, outer); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = tone.paper; ctx.beginPath(); ctx.roundRect(0, -cardH, cardW, cardH, outer); ctx.fill();
  ctx.strokeStyle = '#000047'; ctx.lineWidth = 2 * s; ctx.stroke();
  ctx.globalAlpha = .3; ctx.lineWidth = s; ctx.beginPath(); ctx.roundRect(4 * s, -cardH + 4 * s, cardW - 8 * s, cardH - 8 * s, inner); ctx.stroke(); ctx.globalAlpha = 1;

  let y = -cardH + 26 * s; ctx.fillStyle = tone.ink; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  date(); dateLines.forEach(line => { ctx.fillText(line, pad, y + 2 * s); y += 16 * s; });
  y += 14 * s; ctx.letterSpacing = '0px'; ctx.font = `${size}px 'Oooh Baby'`;
  lines.forEach(line => { ctx.fillText(line, pad, y + size * .1); y += size * 1.25; });
  y += 8 * s; ctx.font = `${26 * s}px 'Oooh Baby'`; ctx.fillStyle = tone.soft; ctx.textAlign = 'right'; ctx.fillText(`— ${by}`, cardW - pad - 4 * s, y + 4 * s);
  y += 39 * s + 14 * s; ctx.font = `400 ${12 * s}px 'Bricolage Grotesque Variable'`; ctx.fillStyle = tone.soft; ctx.textAlign = 'center';
  ctx.fillText('Pick your card at reaganmarfo.com', cardW / 2, y);
  ctx.restore();

  const art = document.querySelector('.card-jar-art')?.cloneNode(true) as SVGElement | undefined;
  if (art) {
    art.setAttribute('width', String(jarW)); art.setAttribute('height', String(jarH)); art.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const img = new Image(); img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(art))}`;
    try { await img.decode(); ctx.drawImage(img, jarX, jarBottom - jarH, jarW, jarH); } catch {}
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#000047';
  ctx.font = `700 ${34}px 'Bricolage Grotesque Variable'`; ctx.letterSpacing = '0px'; ctx.fillText('REAGAN.', jarX + jarW + 40, jarBottom - jarH / 2 + 4);
  ctx.font = `400 ${26}px 'Bricolage Grotesque Variable'`; ctx.fillStyle = '#756a84'; ctx.fillText('A new card every day', jarX + jarW + 40, jarBottom - jarH / 2 + 44);
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not create image')), 'image/png'));
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// The notes in the jar use the same hand-drawn outline as the full card (CSS border-radius
// 255px 15px 225px 15px / 15px 225px 15px 255px), so the note that leaves the jar is a tiny copy of it.
function sketchNote(w: number, h: number) {
  const x = -w / 2, y = -h / 2, [tl, tr, br, bl] = [[.8 * w, .05 * h], [.05 * w, .75 * h], [.7 * w, .05 * h], [.05 * w, .85 * h]];
  return `M${x + tl[0]} ${y} L${x + w - tr[0]} ${y} A${tr[0]} ${tr[1]} 0 0 1 ${x + w} ${y + tr[1]} L${x + w} ${y + h - br[1]} A${br[0]} ${br[1]} 0 0 1 ${x + w - br[0]} ${y + h} L${x + bl[0]} ${y + h} A${bl[0]} ${bl[1]} 0 0 1 ${x} ${y + h - bl[1]} L${x} ${y + tl[1]} A${tl[0]} ${tl[1]} 0 0 1 ${x + tl[0]} ${y} Z`;
}
const jarNotes: [number, number, number, number, number, string][] = [
  [33, 120, 20, 13, -11, '#fff4b5'], [74, 121, 22, 13, -9, '#e6ddff'], [89, 110, 17, 16, -10, '#ffe2c8'], [50, 124, 19, 9, 8, '#d8eeff'],
  [39, 105, 21, 16, -15, '#ffdcec'], [66, 111, 25, 18, -6, '#e3f7c9'], [76, 94, 23, 16, 11, '#e6ddff'], [44, 87, 22, 15, -9, '#ffe0d6'],
  [32, 71, 17.5, 15, -13, '#fff4b5'], [82, 75, 22, 14, 10, '#e6ddff'], [57, 71, 20, 15, -10, '#d8eeff'], [50, 54, 20, 13, -11, '#ffdcec'],
  [70, 57, 20, 13, -4, '#e3f7c9'],
];

function Jar({paper}: {paper: string}) {
  const ink = {stroke: '#000047', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return <svg viewBox="0 0 120 140" className="card-jar-art" aria-hidden="true">
    <ellipse cx="60" cy="133" rx="38" ry="4.5" fill="#21153b" opacity=".12"/>
    <g className="card-jar-body">
      <path d="M33 34 C31.5 42 21 46 19.5 58 L18.6 116 C18.4 125 24 130 33 130.3 L87.5 130.6 C96.5 130.4 101.6 125 101.4 116.2 L100.6 58.6 C99.4 46.4 89 42.4 87.4 33.6" fill="#fbfaff" strokeWidth="2.4" {...ink}/>
      <path d="M34.6 36.5 C34 41.8 24.4 46.6 23 57.4 M86.2 36.2 C87 41.6 96.4 46 97.6 57" fill="none" strokeWidth="1.2" opacity=".35" {...ink}/>
      {jarNotes.map(([x, y, w, h, angle, fill], i) => <path key={i} d={sketchNote(w, h)} transform={`translate(${x} ${y}) rotate(${angle})`} fill={fill} strokeWidth="1.6" {...ink}/>)}
      <path className="card-jar-picked" d={sketchNote(15, 14)} transform="translate(63 34) rotate(-8)" fill={paper} strokeWidth="1.6" {...ink}/>
      <path d={sketchNote(12.5, 10)} transform="translate(46.5 43) rotate(20)" fill="#ffe2c8" strokeWidth="1.6" {...ink}/>
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
  const [wait, setWait] = useState('');
  const [tucked, setTucked] = useState(false);
  const root = useRef<HTMLDivElement>(null), jar = useRef<HTMLButtonElement>(null), closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => { const t = today(); setCard(t); setOpened(read() === t.key); }, []);

  // Step out of the way while the footer (social links, contact details) is on screen.
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setTucked(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  function open() {
    if (!card || phase !== 'idle') return;
    setPhase('opening'); setNotice(''); setWait(untilTomorrow()); write(card.key); playOpenSound(motion(1) > 0);
    setTimeout(() => { setPhase('open'); setOpened(true); closeButton.current?.focus({preventScroll: true}); }, motion(shakeMs));
  }
  function close(returnFocus = true) {
    if (phase !== 'open') return;
    setPhase('closing'); if (motion(1)) playCloseSound();
    setTimeout(() => { setPhase('idle'); if (returnFocus) jar.current?.focus({preventScroll: true}); }, motion(returnMs));
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
      const blob = await cardImage(), file = new File([blob], `reagan-card-${card.key}.png`, {type: 'image/png'});
      const text = `${card.message} — ${card.by}`;
      if (navigator.canShare?.({files: [file]})) await navigator.share({files: [file], title: 'My card from Reagan', text});
      else if (navigator.share) await navigator.share({title: 'My card from Reagan', text, url: location.origin});
      else { download(blob, file.name); setNotice('Saved the image so you can share it.'); }
    } catch (e) { if ((e as Error).name !== 'AbortError') setNotice('Couldn’t share. Try downloading instead.'); }
    setBusy(null);
  }

  // On phones, saving goes through the share sheet, which offers "Save Image" (iPhone) or
  // saving to the gallery (Android). Websites can't write to the photo library directly.
  async function save() {
    if (!card) return; setBusy('download'); setNotice('');
    try {
      const blob = await cardImage(), file = new File([blob], `reagan-card-${card.key}.png`, {type: 'image/png'});
      if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({files: [file]})) {
        await navigator.share({files: [file]});
      } else { download(blob, file.name); setNotice('Saved to your downloads.'); }
    } catch (e) { if ((e as Error).name !== 'AbortError') setNotice('Couldn’t save the image.'); }
    setBusy(null);
  }

  // Phones only let a page open the share sheet straight from a tap, so the image is
  // prepared as soon as the card opens rather than after the button is pressed.
  const image = useRef<Promise<Blob> | null>(null);
  useEffect(() => { if (phase === 'open' && card && !image.current) image.current = renderCard(card).catch(() => { image.current = null; throw new Error('render'); }); }, [phase, card]);
  const cardImage = () => (image.current ??= card ? renderCard(card) : Promise.reject(new Error('no card')));

  const showCard = phase === 'open' || phase === 'closing';
  return <>
    <div className={`card-overlay ${phase}`} aria-hidden="true"/>
    <div ref={root} style={card ? {'--card-paper': card.tone.paper, '--card-shadow': card.tone.shadow, '--card-soft': card.tone.soft, '--card-ink': card.tone.ink} as React.CSSProperties : undefined} className={`card-jar-wrap ${phase}${opened ? '' : ' fresh'}${tucked && phase === 'idle' ? ' tucked' : ''}`}>
    {card && showCard && <section className="card-pop" role="dialog" aria-label={`Your card for ${card.label}`}>
      <button ref={closeButton} type="button" className="card-pop-close" onClick={() => close()} aria-label="Put the card back">×</button>
      <p className="card-pop-date">Your card for {card.label}</p>
      <p className="card-pop-message">{card.message}</p>
      <p className="card-pop-signature">— {card.by}</p>
      <div className="card-pop-actions">
        <button type="button" onClick={share} disabled={!!busy}>{busy === 'share' ? 'Preparing…' : 'Share'}</button>
        <button type="button" onClick={save} disabled={!!busy}>{busy === 'download' ? 'Saving…' : 'Download'}</button>
      </div>
      <p className="card-pop-note" role="status">{notice || <>A new card lands tomorrow <span className="card-pop-wait">· in {wait}</span></>}</p>
    </section>}
    <button ref={jar} type="button" className="card-jar" onClick={() => phase === 'open' ? close() : open()} aria-expanded={showCard} aria-label={opened ? 'Read today’s card again' : 'Open the jar for today’s card'}>
      <Jar paper={card?.tone.paper ?? '#fff1b8'}/>
    </button>
  </div>
  </>;
}
