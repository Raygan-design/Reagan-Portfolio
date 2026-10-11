'use client';
import { Arrow } from '@/components/arrow';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { safeExternalUrl } from '@/lib/site';

export function Film({src,poster,title='MY STORY · FILM',className=''}:{src?:string;poster?:string;title?:string;className?:string}){
  const dialog=useRef<HTMLDialogElement>(null);const video=useRef<HTMLVideoElement>(null);
  const media=safeExternalUrl(src);
  function close(){video.current?.pause();dialog.current?.close()}
  return <><div className={`film ${className}`}>{poster&&<Image src={poster} alt="Reagan Marfo" fill sizes="(max-width: 700px) 90vw, 92vw" className="film-poster" priority/>}<span className="film-label eyebrow">{title}</span><button className="play-button" onClick={()=>dialog.current?.showModal()} aria-label={`Play ${title}`}>PLAY <span aria-hidden="true">▶</span></button><span className="film-caption eyebrow">{poster?'CREATED TO CREATE':'UNSCRIPTED WITH RAYGAN'}</span></div><dialog ref={dialog} className="video-dialog" onClose={()=>video.current?.pause()} aria-label={title}><button className="icon-button" onClick={close} autoFocus aria-label="Close video">×</button>{media?<video ref={video} src={media} controls playsInline preload="none"/>:<p role="status">This film isn’t available here yet. Please check back soon.</p>}</dialog></>;
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
