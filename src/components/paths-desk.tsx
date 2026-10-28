'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useState} from 'react';
import {Arrow} from '@/components/arrow';
import {services} from '@/lib/catalog';

// Speaking / Consulting as two polaroids on a desk: tap one to pick it up and turn it over.
// It works the same way on desktop and mobile.
const paths=[
  {key:'speaking',num:'01',label:'SPEAKING & HOSTING',title:'Speaking & Event hosting',short:'Speaking',text:'Book me for your next conference, summit or company event. I speak on creativity, design, technology, entrepreneurship and purpose.',topics:['Creativity','Design','Technology','Entrepreneurship','Purpose'],cta:'EXPLORE SPEAKING',href:'/speaking',image:'/images/01M1Y7NVNZ8PHDQ6NM6MRMCTEC.webp'},
  {key:'consulting',num:'02',label:'ONE-TO-ONE',title:'Creative consulting',short:'Consulting',text:'Get practical guidance on product and design, podcast development, personal branding, content strategy or turning a creative idea into a clear plan.',topics:services.map(s=>s.title),cta:'BOOK A SESSION',href:'/consulting',image:'/images/01M1Y233ZF9XV5D7QME1AAYJA9.webp'},
];

export function PathsDesk(){const [up,setUp]=useState<number|null>(null);const pick=(i:number)=>setUp(up===i?null:i);return <section className="section pc pc-8">
  <div className="pc8-desk">
    <span className="handwritten pc8-label">pick one up</span>
    {paths.map((p,i)=><div key={p.key} className={`pc8-polaroid p${i}${up===i?' up':''}${up!==null&&up!==i?' away':''}`} onClick={e=>{if((e.target as HTMLElement).closest('a'))return;pick(i)}}><div className="pc8-inner">
      <div className="pc8-front"><span className="pc8-tape" aria-hidden="true"/><div className="pc8-photo"><Image src={p.image} alt="" fill sizes="(max-width:760px) 50vw, 340px"/></div><span className="handwritten">{p.short}</span></div>
      <div className="pc8-back"><div className="pc8-back-top"><span className="eyebrow">{p.num} / {p.label}</span><span className="pc8-flip">turn back ↺</span></div><h2>{p.title}</h2><p>{p.text}</p><ul>{p.topics.map(t=><li key={t}>{t}</li>)}</ul><Link className="button" href={p.href}>{p.cta} <Arrow/></Link></div>
    </div></div>)}
  </div>
</section>}

