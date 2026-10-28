import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import paper from '@/content/paper.json';
import {MentorQuotes} from '@/components/mentor-quotes';
export const metadata:Metadata={title:{absolute:'About — Becoming Reagan Marfo'}};
const t=paper['4I4-0'].text, photos=paper['4I4-0'].images;
function Photo({i,alt,className=''}:{i:number;alt:string;className?:string}){return <div className={`album-photo ${className}`}><Image src={photos[i]} alt={alt} fill sizes="(max-width:700px) 90vw, 50vw"/></div>}
function Chapter({date,title,paragraphs}:{date:number;title:number;paragraphs:number[]}){return <div className="chapter-copy"><p className="eyebrow">{t[date]}</p><h2>{t[title]}</h2><div className="chapter-paragraphs">{paragraphs.map(i=><p key={i}>{t[i]}</p>)}</div></div>}
export default function About(){return <><div className="page-entrance" key="about">
  <section className="section about-hero"><div><p className="eyebrow">{t[8]}</p><h1>{t[9]}<br/>{t[10]}</h1></div><p>{t[11]}<br/><br/>{t[12]}</p></section>
  <section className="section contact-sheet"><div className="portrait"><Photo i={0} alt="Reagan Marfo in a dark suit"/><span className="photo-tag">{t[13]}</span></div><div className="contact-sheet-notes"><div className="note"><p className="handwritten">{t[14]}</p><p>{t[15]}</p></div><div className="note night"><p className="eyebrow">{t[16]}</p><h2>{t[17]}<br/>{t[18]}<br/>{t[19]}</h2></div></div></section>
  <section className="section chapter first-design"><Chapter date={39} title={40} paragraphs={[41,42,43]}/><div className="design-samples"><div className="note night"><p className="sample-price">{t[44]}</p><div className="logo-pair"><Photo i={4} alt="Original Marpid Designs logo in gold"/><Photo i={5} alt="Original Marpid Designs logo in magenta"/></div></div><div className="sample-screens">{[6,7,8].map((i)=><Photo key={i} i={i} alt={`Early interface design, example ${i-5}`}/>)}</div></div></section>
  <section className="section chapter-wide"><Chapter date={45} title={46} paragraphs={[47,48,49]}/><div className="work-album work-album-clean"><Photo i={9} alt="Reagan with colleagues at DNAR"/><div className="note dark mentorship"><div><p className="eyebrow">{t[52]}</p><h3>{t[53]}</h3></div><MentorQuotes/></div></div></section>
  <section className="section chapter night"><div className="portrait"><Photo i={15} alt="Reagan Marfo seated in a black suit"/><span className="photo-tag">{t[55]}</span></div><Chapter date={56} title={57} paragraphs={[58,59,60,61]}/></section>
  <section className="section story-closing"><div><p className="eyebrow">{t[62]}</p><h2>{t[63]}</h2></div><div><p>{t[64]}</p><p className="handwritten">{t[65]}</p><Link className="button" href="/#ventures">{t[66]}</Link></div></section>
  </div></>}
