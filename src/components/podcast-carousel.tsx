'use client';
import Image from 'next/image';
import {useEffect,useRef,useState} from 'react';
export type PodcastSlide={src:string;alt:string};
export function PodcastCarousel({slides}:{slides:PodcastSlide[]}){
 const root=useRef<HTMLDivElement>(null),touch=useRef<number|null>(null);
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(true),[hovered,setHovered]=useState(false),[visible,setVisible]=useState(false),[pageVisible,setPageVisible]=useState(true),[reduced,setReduced]=useState(true);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(media.matches);sync();media.addEventListener('change',sync);const visibility=()=>setPageVisible(!document.hidden);visibility();document.addEventListener('visibilitychange',visibility);const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.2});if(root.current)observer.observe(root.current);return()=>{media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',visibility);observer.disconnect()}},[]);
 const rotating=playing&&!reduced&&!hovered&&visible&&pageVisible&&slides.length>1;
 useEffect(()=>{if(!rotating)return;const id=setInterval(()=>setIndex(i=>(i+1)%slides.length),3000);return()=>clearInterval(id)},[rotating,slides.length]);
 function move(delta:number){setIndex(i=>(i+delta+slides.length)%slides.length)}
 if(!slides.length)return null;
 return <div ref={root} className="podcast-carousel" tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Unscripted with Raygan photos" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setPlaying(false)} onBlur={()=>setPlaying(true)} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}}} onTouchStart={e=>{touch.current=e.touches[0].clientX}} onTouchEnd={e=>{if(touch.current!==null){const distance=e.changedTouches[0].clientX-touch.current;if(Math.abs(distance)>50)move(distance<0?1:-1);touch.current=null}}}>
  <div className="podcast-carousel-image" role="group" aria-roledescription="slide" aria-label={`${index+1} of ${slides.length}`}><Image key={slides[index].src} src={slides[index].src} alt={slides[index].alt} fill sizes="(max-width:760px) 100vw, 55vw"/></div>

 </div>;
}
