import {Arrow} from '@/components/arrow';
import type {Metadata} from 'next';
import Link from 'next/link';
import paper from '@/content/paper.json';
import {EventAlbums,Film,type EventAlbum} from '@/components/media';
import {site} from '@/lib/site';

export const metadata:Metadata={title:'Speaking + Hosting'};

export default function Speaking(){
 const images=paper['1A7-0'].images;
 const albums:EventAlbum[]=[
  {name:'The Gospel Academy',images:images.slice(0,7)},
  {name:'FIDCON',images:images.slice(7,12)},
  {name:'Purpose Circles',images:images.slice(12,21)},
 ];
 return <div className="page-entrance" key="speaking">
  <section className="section speaking-hero"><div><p className="eyebrow">SPEAKING + EVENT HOSTING</p><h1>Ideas for rooms ready to think bigger.</h1></div><div><p>Book me to speak, join a panel, moderate a conversation or host your next gathering.</p><Link className="button" href="/speaking/enquiry">MAKE ENQUIRY <Arrow/></Link></div></section>
  <section className="section speaking-content">
   <EventAlbums albums={albums}/>
   <div className="reels"><div className="section-heading"><h2>Portrait showreels</h2><p>Short moments from talks, panels and hosted conversations.</p></div><div className="reel-grid">{['Created to Create','Building in Africa','Think Bigger'].map((title,index)=><div className={`reel reel-${index}`} key={title}><Film src={site.reels[index]} title={`REEL 0${index+1} / ${['00:42','00:31','00:54'][index]}`}/><h3>{title}</h3></div>)}</div></div>
  </section>
 </div>;
}
