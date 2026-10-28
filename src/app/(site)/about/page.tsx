import type { Metadata } from 'next';
import {jsonLdScript,pageMetadata,profileJsonLd} from '@/lib/seo';
import Image from 'next/image';
import paper from '@/content/paper.json';
import {MentorQuotes} from '@/components/mentor-quotes';
export const metadata:Metadata=pageMetadata({title:'About — Becoming Reagan Marfo',absoluteTitle:true,path:'/about',image:'about',description:'How Reagan Marfo went from designing graphics on campus to product design, founding thedsgnjunkies and Greyend Studio, and hosting Unscripted with Raygan.'});
const t=paper['4I4-0'].text, photos=paper['4I4-0'].images;
function Photo({i,alt,className=''}:{i:number;alt:string;className?:string}){return <div className={`album-photo ${className}`}><Image src={photos[i]} alt={alt} fill sizes="(max-width:700px) 90vw, 50vw"/></div>}
function Chapter({date,title,paragraphs}:{date:number;title:number;paragraphs:number[]}){return <div className="chapter-copy"><p className="eyebrow">{t[date]}</p><h2>{t[title]}</h2><div className="chapter-paragraphs">{paragraphs.map(i=><p key={i}>{t[i]}</p>)}</div></div>}
export default function About(){return <><script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(profileJsonLd())}/><div className="page-entrance" key="about">
  <section className="section about-hero"><div><p className="eyebrow">{t[8]}</p><h1>{t[9]}<br/>{t[10]}</h1></div><p>{t[11]}<br/><br/>{t[12]}</p></section>
  <section className="section contact-sheet"><div className="portrait"><Photo i={0} alt="Reagan Marfo in a dark suit"/><span className="photo-tag">{t[13]}</span></div><div className="about-bio"><p className="about-roles" aria-hidden="true"><span>Designer.</span><span>Speaker.</span><span>Host.</span></p><p>Reagan Marfo is a creative entrepreneur, product designer, speaker, and the host of Unscripted with Raygan — Africa’s leading business and creators podcast. He built his career at the intersection of design, media and storytelling.</p></div></section>
  <section className="section chapter first-design"><Chapter date={39} title={40} paragraphs={[41,42,43]}/><div className="design-samples"><div className="note night"><p className="sample-price">{t[44]}</p><div className="logo-pair"><Photo i={4} alt="Original Marpid Designs logo in gold"/><Photo i={5} alt="Original Marpid Designs logo in magenta"/></div></div><div className="sample-screens">{[6,7,8].map((i)=><Photo key={i} i={i} alt={`Early interface design, example ${i-5}`}/>)}</div></div></section>
  <section className="section chapter-wide"><Chapter date={45} title={46} paragraphs={[47,48,49]}/><div className="work-album work-album-clean"><Photo i={9} alt="Reagan with colleagues at DNAR"/><div className="note dark mentorship"><div><p className="eyebrow">{t[52]}</p><h3>{t[53]}</h3></div><MentorQuotes/></div></div></section>
  <section className="section chapter night"><div className="portrait"><Photo i={15} alt="Reagan Marfo seated in a black suit"/><span className="photo-tag">{t[55]}</span></div><Chapter date={56} title={57} paragraphs={[58,59,60,61]}/></section>
  </div></>}
