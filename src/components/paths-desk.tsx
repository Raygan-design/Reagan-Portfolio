'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Arrow} from '@/components/arrow';
import {services} from '@/lib/catalog';

// Speaking / Consulting as two taped-down cards. Each opens on its details; tap it to turn it
// over (Speaking to a slideshow of photos, Consulting to client testimonials), and tap again to
// turn it back. Same on desktop and mobile.
// The tilt lives on .pc8-polaroid and the page's scroll-in rise on its .pc8-slot wrapper, so
// the two transforms never fight.
const paths=[
  {key:'speaking',num:'01',label:'SPEAKING & HOSTING',title:'Speaking & Event hosting',short:'Speaking & Event hosting',flip:'see photos',text:'Book me for your next conference, summit or company event. I speak on creativity, design, technology, entrepreneurship and purpose.',topics:['Creativity','Design','Technology','Entrepreneurship','Purpose'],cta:'EXPLORE SPEAKING',href:'/speaking',
    images:['/images/01M1Y7NVNZ8PHDQ6NM6MRMCTEC.webp','/images/01M1Y7JMRDYV5AQF8GS2H73PT7.webp','/images/01M1Y7P55KEFSDB8SQQGJ1Q2EG.webp','/images/01M1Y7JMRC2XWKYBD3QV25TCMM.webp','/images/01M1Y7R9BWCZPE29S3DAZ0TNSH.webp']},
  {key:'consulting',num:'02',label:'ONE-TO-ONE',title:'Creative consulting',short:'Kind words',flip:'kind words',text:'Get practical guidance on product and design, podcast development, personal branding, content strategy or turning a creative idea into a clear plan.',topics:services.map(s=>s.title),cta:'BOOK A SESSION',href:'/consulting',
    // PLACEHOLDERS: replace with real client testimonials before this goes live.
    quotes:[
      {quote:'Placeholder testimonial. A client’s words about their session go here, one or two sentences long.',name:'Client name',role:'Role, Company'},
      {quote:'Placeholder testimonial. What changed for them after working together on their idea, product or brand.',name:'Client name',role:'Role, Company'},
      {quote:'Placeholder testimonial. A short line on what the session was like and what they took away.',name:'Client name',role:'Role, Company'},
    ]},
];

type Quote={quote:string;name:string;role:string};
// Steps through a card's slides (photos or testimonials) while it is turned over.
function useSlide(count:number,playing:boolean,ms:number){
  const [n,setN]=useState(0);
  useEffect(()=>{if(!playing)return;const t=setInterval(()=>setN(x=>(x+1)%count),ms);return ()=>clearInterval(t)},[playing,count,ms]);
  return n;
}
const Dots=({count,n}:{count:number;n:number})=><div className="pc8-dots" aria-hidden="true">{Array.from({length:count},(_,i)=><i key={i} className={i===n?'on':''}/>)}</div>;
function Slides({images,playing}:{images:string[];playing:boolean}){
  const n=useSlide(images.length,playing,2600);
  return <><div className="pc8-photo">{images.map((src,i)=><Image key={src} src={src} alt="" fill sizes="(max-width:760px) 90vw, 340px" className={i===n?'on':''}/>)}</div><Dots count={images.length} n={n}/></>;
}
function Quotes({quotes,playing}:{quotes:Quote[];playing:boolean}){
  const n=useSlide(quotes.length,playing,5200);
  return <><div className="pc8-photo pc8-quotes">{quotes.map((q,i)=><figure key={i} className={i===n?'on':''} aria-hidden={i!==n}>
    <span className="pc8-mark" aria-hidden="true">“</span><blockquote>{q.quote}</blockquote>
    <figcaption><span className="pc8-avatar" aria-hidden="true">{q.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</span><span><b>{q.name}</b>{q.role}</span></figcaption>
  </figure>)}</div><Dots count={quotes.length} n={n}/></>;
}

export function PathsDesk(){const [turned,setTurned]=useState<number[]>([]);const turn=(i:number)=>setTurned(t=>t.includes(i)?t.filter(x=>x!==i):[...t,i]);return <section className="section pc pc-8">
  <div className="pc8-desk">
    {paths.map((p,i)=><div key={p.key} className="pc8-slot"><div className={`pc8-polaroid p${i}${turned.includes(i)?' turned':''}`} onClick={e=>{if((e.target as HTMLElement).closest('a'))return;turn(i)}}>
      <div className="pc8-inner">
        <div className="pc8-info"><span className="pc8-tape" aria-hidden="true"/><div className="pc8-info-top"><span className="eyebrow">{p.num} / {p.label}</span><span className="pc8-flip">{p.flip} ↻</span></div><h2>{p.title}</h2><p>{p.text}</p><ul>{p.topics.map(t=><li key={t}>{t}</li>)}</ul><Link className="button" href={p.href}>{p.cta} <Arrow/></Link></div>
        <div className="pc8-pics"><span className="pc8-tape" aria-hidden="true"/>{p.quotes?<Quotes quotes={p.quotes} playing={turned.includes(i)}/>:<Slides images={p.images??[]} playing={turned.includes(i)}/>}<span className="handwritten">{p.short}</span></div>
      </div>
    </div></div>)}
  </div>
</section>}
