'use client';
import { Arrow } from '@/components/arrow';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { safeExternalUrl } from '@/lib/site';

export function Film({src,youtube,heading,poster,title='MY STORY · FILM',className=''}:{src?:string;youtube?:string;heading?:string;poster?:string;title?:string;className?:string}){
  const dialog=useRef<HTMLDialogElement>(null);const video=useRef<HTMLVideoElement>(null);
  // A YouTube film only loads while the dialog is open, so closing it stops playback.
  const [open,setOpen]=useState(false);
  const media=src?.startsWith('/')&&!src.startsWith('//')?src:safeExternalUrl(src);
  function close(){video.current?.pause();dialog.current?.close()}
  function play(){setOpen(true);dialog.current?.showModal()}
  return <><div className={`film ${className}`}>{poster&&<Image src={poster} alt="Reagan Marfo" fill sizes="(max-width: 700px) 90vw, 92vw" className="film-poster" priority/>}<span className="film-label eyebrow">{title}</span><button className="play-button" onClick={play} aria-label={`Play ${title}`}>PLAY <span aria-hidden="true">▶</span></button><span className="film-caption eyebrow">{poster?'CREATED TO CREATE':'UNSCRIPTED WITH RAYGAN'}</span></div>{youtube?<dialog ref={dialog} className="film-modal" onClose={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)close()}} aria-label={heading||title}><div className="film-modal-bar"><div><span className="eyebrow">{title}</span>{heading&&<strong>{heading}</strong>}</div><button className="film-modal-close" onClick={close} autoFocus aria-label="Close video">CLOSE <span aria-hidden="true">×</span></button></div><div className="film-modal-frame">{open&&<iframe src={`https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1&rel=0&playsinline=1`} title={heading||title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/>}</div><a className="film-modal-link" href={`https://www.youtube.com/watch?v=${youtube}`} target="_blank" rel="noopener noreferrer">WATCH ON YOUTUBE <Arrow/></a></dialog>:<dialog ref={dialog} className="video-dialog" onClose={()=>video.current?.pause()} aria-label={title}><button className="icon-button" onClick={close} autoFocus aria-label="Close video">×</button>{media?<video ref={video} src={media} controls playsInline preload="none"/>:<p role="status">This film isn’t available here yet. Please check back soon.</p>}</dialog>}</>;
}
export function Gallery({images,labels,compact=false}:{images:string[];labels?:string[];compact?:boolean}){
  const track=useRef<HTMLDivElement>(null);const [active,setActive]=useState(0);
  function move(delta:number){const el=track.current;if(!el)return;const next=Math.max(0,Math.min(images.length-1,active+delta)); const child=el.children[next] as HTMLElement;el.scrollTo({left:child.offsetLeft,behavior:'instant'});}
  function update(){const el=track.current;if(!el)return;let closest=0,dist=Infinity;Array.from(el.children).forEach((c,i)=>{const d=Math.abs((c as HTMLElement).offsetLeft-el.scrollLeft);if(d<dist){dist=d;closest=i}});setActive(closest)}
  return <div className={compact?'gallery compact-gallery':'gallery'}>
    {!compact&&<div className="section-heading"><h2>From stages and conversations</h2><span className="gallery-instruction">Swipe through the gallery</span></div>}
    <div ref={track} className="gallery-track" onScroll={update} tabIndex={0} role="region" aria-label="Photo gallery" onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}}}>{images.map((src,i)=><figure key={src} className="gallery-slide"><Image src={src} alt={labels?.[i]||`Reagan speaking at an event, photograph ${i+1}`} fill sizes={compact?'(max-width:700px) 80vw, 350px':'(max-width:700px) 80vw, 500px'}/>{labels&&<figcaption>{labels[i]}</figcaption>}</figure>)}</div>
    <div className="gallery-controls"><span className="eyebrow" aria-live="polite" aria-atomic="true">{String(active+1).padStart(2,'0')} / {images.length}</span>{!compact&&<span className="gallery-hint">Drag or use arrows to explore all {images.length} photos</span>}<div className="arrow-buttons"><button className="icon-button" aria-label="Previous photo" disabled={active===0} onClick={()=>move(-1)}><Arrow direction="left"/></button><button className="icon-button" aria-label="Next photo" disabled={active===images.length-1} onClick={()=>move(1)}><Arrow direction="right"/></button></div></div>
  </div>;
}

export type EventAlbum={name:string;images:string[]};

export function EventAlbums({albums}:{albums:EventAlbum[]}){
  const dialog=useRef<HTMLDialogElement>(null),track=useRef<HTMLDivElement>(null);
  const [selected,setSelected]=useState<number|null>(null),[active,setActive]=useState(0);
  const album=selected===null?null:albums[selected];
  useEffect(()=>{if(album&&!dialog.current?.open)dialog.current?.showModal()},[album]);
  function open(index:number){setActive(0);setSelected(index)}
  function close(){dialog.current?.close()}
  function move(delta:number){if(!album)return;const next=Math.max(0,Math.min(album.images.length-1,active+delta));const child=track.current?.children[next] as HTMLElement|undefined;if(child)track.current?.scrollTo({left:child.offsetLeft,behavior:'smooth'});setActive(next)}
  function update(){const el=track.current;if(!el)return;let closest=0,dist=Infinity;Array.from(el.children).forEach((child,index)=>{const distance=Math.abs((child as HTMLElement).offsetLeft-el.scrollLeft);if(distance<dist){dist=distance;closest=index}});setActive(closest)}
  return <div className="event-albums">
    <div className="section-heading"><h2>From stages and conversations</h2><span className="gallery-instruction">Choose an event to view the album</span></div>
    <div className="event-album-grid">{albums.map((item,index)=><button type="button" className="event-album-card" key={item.name} onClick={()=>open(index)} aria-label={`Open ${item.name} photo album, ${item.images.length} photos`}>
      <span className="event-album-cover"><Image src={item.images[0]} alt="" fill sizes="(max-width:700px) 92vw, 31vw"/></span>
      <span className="event-album-meta"><strong>{item.name}</strong><span className="event-album-open">VIEW ALBUM <Arrow/></span></span>
    </button>)}</div>
    <dialog ref={dialog} className="event-album-dialog" aria-labelledby="event-album-title" onClose={()=>setSelected(null)} onClick={event=>{if(event.target===event.currentTarget)close()}}>
      {album&&<div className="event-album-viewer" onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1)}}}>
        <header><div><p className="eyebrow">EVENT ALBUM</p><h2 id="event-album-title">{album.name}</h2></div><button className="icon-button" onClick={close} autoFocus aria-label="Close photo album">×</button></header>
        <div ref={track} className="event-album-track" onScroll={update} tabIndex={0} role="region" aria-label={`${album.name} photos`}>
          {album.images.map((src,index)=><figure key={src}><Image src={src} alt={`${album.name}, photograph ${index+1}`} fill sizes="100vw" priority={index===0}/></figure>)}
        </div>
        <footer><span className="eyebrow" aria-live="polite" aria-atomic="true">{String(active+1).padStart(2,'0')} / {String(album.images.length).padStart(2,'0')}</span><span className="gallery-hint">Swipe or use the arrow keys</span><div className="arrow-buttons"><button className="icon-button" aria-label="Previous photo" disabled={active===0} onClick={()=>move(-1)}><Arrow direction="left"/></button><button className="icon-button" aria-label="Next photo" disabled={active===album.images.length-1} onClick={()=>move(1)}><Arrow direction="right"/></button></div></footer>
      </div>}
    </dialog>
  </div>;
}
// A portrait showreel that plays inside its own card instead of a dialog.
export function Reel({src,poster,label,title,index}:{src?:string;poster?:string;label:string;title:string;index:number}){
  const video=useRef<HTMLVideoElement>(null);const [playing,setPlaying]=useState(false);const [started,setStarted]=useState(false);
  const media=src?.startsWith('/')&&!src.startsWith('//')?src:safeExternalUrl(src);
  // Only one reel plays at a time: starting one (by its button or its own controls) pauses the others.
  function pauseOthers(){document.querySelectorAll<HTMLVideoElement>('.reel video').forEach(other=>{if(other!==video.current)other.pause()})}
  function play(){setStarted(true);video.current?.play()}
  return <div className={`reel reel-${index}${started?' started':''}${playing?' playing':''}`}>
    <div className="film">
      {media?<video ref={video} src={media} poster={poster} playsInline preload="metadata" controls={started} onPlay={()=>{pauseOthers();setPlaying(true);setStarted(true)}} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);setStarted(false);if(video.current)video.current.currentTime=0}} aria-label={title}/>
        :poster&&<Image src={poster} alt="" fill sizes="(max-width: 760px) 90vw, 30vw" className="film-poster"/>}
      <span className="film-label eyebrow">{label}</span>
      {media?<button className="play-button" onClick={play} aria-label={`Play ${title}`}>PLAY <span aria-hidden="true">▶</span></button>:<span className="reel-soon eyebrow">COMING SOON</span>}
    </div>
    <h3>{title}</h3>
  </div>;
}
