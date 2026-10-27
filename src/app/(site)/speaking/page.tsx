import {Arrow} from '@/components/arrow';
import type {Metadata} from 'next';
import Link from 'next/link';
import paper from '@/content/paper.json';
import {EventAlbums,Reel,type EventAlbum} from '@/components/media';
import {site} from '@/lib/site';

export const metadata:Metadata={title:'Speaking + Hosting'};

const reels=[
  {title:'The Becoming Experience',src:'/videos/the-becoming-experience.mp4',poster:'/images/reels/the-becoming-experience.jpg',length:'00:31'},
  {title:'Afternoon Show @ TV3',src:'/videos/afternoon-show-tv3.mp4',poster:'/images/reels/afternoon-show-tv3.jpg',length:'00:40'},
  {title:'Think Bigger',src:site.reels[2],length:'00:54'},
];
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
   <div className="reels"><div className="section-heading"><h2>Portrait showreels</h2><p>Short moments from talks, panels and hosted conversations.</p></div><div className="reel-grid">{reels.map((reel,index)=><Reel key={reel.title} index={index} src={reel.src} poster={'poster' in reel?reel.poster:undefined} title={reel.title} label={`REEL 0${index+1} / ${reel.length}`}/>)}</div></div>
  </section>
 </div>;
}
