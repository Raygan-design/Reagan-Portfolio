'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Arrow} from '@/components/arrow';
import {services} from '@/lib/catalog';

// Speaking / Consulting as two taped-down cards. Each opens on its details; tap it to turn it
// over to a slideshow of photos, and tap again to turn it back. Same on desktop and mobile.
// The tilt lives on .pc8-polaroid and the page's scroll-in rise on its .pc8-slot wrapper, so
// the two transforms never fight.
const paths=[
  {key:'speaking',num:'01',label:'SPEAKING & HOSTING',title:'Speaking & Event hosting',short:'Speaking',text:'Book me for your next conference, summit or company event. I speak on creativity, design, technology, entrepreneurship and purpose.',topics:['Creativity','Design','Technology','Entrepreneurship','Purpose'],cta:'EXPLORE SPEAKING',href:'/speaking',
    images:['/images/01M1Y7NVNZ8PHDQ6NM6MRMCTEC.webp','/images/01M1Y7JMRDYV5AQF8GS2H73PT7.webp','/images/01M1Y7P55KEFSDB8SQQGJ1Q2EG.webp','/images/01M1Y7JMRC2XWKYBD3QV25TCMM.webp','/images/01M1Y7R9BWCZPE29S3DAZ0TNSH.webp']},
  {key:'consulting',num:'02',label:'ONE-TO-ONE',title:'Creative consulting',short:'Consulting',text:'Get practical guidance on product and design, podcast development, personal branding, content strategy or turning a creative idea into a clear plan.',topics:services.map(s=>s.title),cta:'BOOK A SESSION',href:'/consulting',
    images:['/images/01M1Y233ZF9XV5D7QME1AAYJA9.webp','/images/01M1Y7R9BW6447CG4VFFD712EG.webp','/images/08E5H8PD7X3R3R12CTMEP7ANHZ.webp','/images/01M1Y7R9BW40JX6DHDF6ZS9M5S.webp']},
];

// Cross-fades through a card's photos while it is turned over.
function Slides({images,playing}:{images:string[];playing:boolean}){
  const [n,setN]=useState(0);
  useEffect(()=>{if(!playing)return;const t=setInterval(()=>setN(x=>(x+1)%images.length),2600);return ()=>clearInterval(t)},[playing,images.length]);
  return <><div className="pc8-photo">{images.map((src,i)=><Image key={src} src={src} alt="" fill sizes="(max-width:760px) 90vw, 340px" className={i===n?'on':''}/>)}</div>
    <div className="pc8-dots" aria-hidden="true">{images.map((src,i)=><i key={src} className={i===n?'on':''}/>)}</div></>;
}

export function PathsDesk(){const [turned,setTurned]=useState<number[]>([]);const turn=(i:number)=>setTurned(t=>t.includes(i)?t.filter(x=>x!==i):[...t,i]);return <section className="section pc pc-8">
  <div className="pc8-desk">
    <span className="handwritten pc8-label">tap a card</span>
    {paths.map((p,i)=><div key={p.key} className="pc8-slot"><div className={`pc8-polaroid p${i}${turned.includes(i)?' turned':''}`} onClick={e=>{if((e.target as HTMLElement).closest('a'))return;turn(i)}}>
      <div className="pc8-inner">
        <div className="pc8-info"><span className="pc8-tape" aria-hidden="true"/><div className="pc8-info-top"><span className="eyebrow">{p.num} / {p.label}</span><span className="pc8-flip">see photos ↻</span></div><h2>{p.title}</h2><p>{p.text}</p><ul>{p.topics.map(t=><li key={t}>{t}</li>)}</ul><Link className="button" href={p.href}>{p.cta} <Arrow/></Link></div>
        <div className="pc8-pics"><span className="pc8-tape" aria-hidden="true"/><Slides images={p.images} playing={turned.includes(i)}/><span className="handwritten">{p.short}</span></div>
      </div>
    </div></div>)}
  </div>
</section>}
