import Image from 'next/image';
import {HeroHeadline} from '@/components/hero-headline';
import {PodcastCarousel} from '@/components/podcast-carousel';
import podcastSlides from '@/content/podcast-slides.json';
import { Arrow } from '@/components/arrow';
import Link from 'next/link';
import { ExternalLink } from '@/components/chrome';
import { Film } from '@/components/media';
import { PathsDesk } from '@/components/paths-desk';
import { site } from '@/lib/site';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import paper from '@/content/paper.json';

export const metadata:Metadata=pageMetadata({title:'Reagan Marfo — Creative Entrepreneur',absoluteTitle:true,path:'/',description:'I’m Reagan Marfo, a Ghanaian creative entrepreneur telling stories, building communities and designing products. Podcast host, speaker and product designer.'});

// The brand logos link to the video Raygan made for each brand.
const brands:{name:string;file:string;width:number;height:number;video?:string}[]=[
  {name:'Sendwave',file:'sendwave',width:898,height:124,video:'https://www.instagram.com/reel/DbxcFg5g9uy/'},
  {name:'Absa',file:'absa',width:1280,height:1280},
  {name:"Zoe Health’Care",file:'zoe-healthcare',width:2673,height:972,video:'https://www.instagram.com/reel/DbNmuDXANcY/'},
  {name:'Choppity',file:'choppity',width:4794,height:714,video:'https://www.instagram.com/reel/DWoLjkEDC8N/'},
];
export default function Home(){return <>
  <div className="home-entrance">
  <section className="home-hero section"><div className="hero-kickers eyebrow"><span>I DO A LOT OF THINGS</span><span>I AM A BORING PERSON</span></div><div className="home-intro"><HeroHeadline/><p className="handwritten">Created to Create.</p></div><div className="hero-bottom"><p>My mission is to change narratives, challenge limiting beliefs, and inspire people to recognise that they can do more and achieve greatness.</p><div className="hero-actions"><ExternalLink className="button" href={site.podcastYoutube}>WATCH PODCAST <Arrow/></ExternalLink></div></div></section>
  <div className="home-film"><Film poster={paper['OR-0'].images[0]} youtube="P7m_gCL0djs" heading="Born into Hardship, Built to Execute"/></div>
  </div>
  <section id="ventures" className="section venture-section"><div className="section-heading"><div><p className="eyebrow">01 / VENTURES</p><h2 className="display-heading">What I’m building.</h2></div></div><div className="venture-list">{site.ventures.map((v,i)=><ExternalLink className="venture-row" key={v.name} href={v.href}><span className="eyebrow venture-number">0{i+1}</span><h3>{v.name}</h3><p>{v.description}</p><span className="venture-arrow" aria-hidden="true"><Arrow/></span></ExternalLink>)}</div></section>
  <section id="podcast" className="section podcast-section"><div className="podcast-copy"><div><p className="eyebrow">02 / PODCAST</p><h2 className="display-heading">Conversations behind Africa’s success.</h2></div><div><p>Unscripted with Raygan is a Ghanaian podcast exploring the real journeys, challenges and practical lessons behind Africa’s entrepreneurs, creators and innovators.</p><div className="podcast-actions"><ExternalLink href={site.podcast} className="button">Learn More <Arrow/></ExternalLink><ExternalLink href={site.podcastYoutube} className="button primary">Watch Podcast <Arrow/></ExternalLink></div></div></div><PodcastCarousel slides={podcastSlides}/></section>
  <section className="section brand-section" id="brand-work"><div className="brand-inner"><div className="section-heading"><h2>Brands I have worked with</h2></div><div className="brand-grid">{brands.map(b=>{const logo=<Image className={`brand-logo brand-logo-${b.file}`} src={`/images/brands/${b.file}.png`} alt={b.name} width={b.width} height={b.height} sizes="(max-width:760px) 40vw, 220px"/>;return <div key={b.file}>{b.video?<ExternalLink className="brand-link" href={b.video}>{logo}<span className="sr-only">Watch the video I made for {b.name}</span></ExternalLink>:logo}</div>})}</div><div className="partnership"><div><p className="eyebrow">PARTNERSHIPS</p><h3>Have a story your audience should see?</h3></div><Link className="button inverse" href="/contact?topic=Brand+partnership">START A CONVERSATION <Arrow/></Link></div></div></section>
  <PathsDesk/>
  </>}
