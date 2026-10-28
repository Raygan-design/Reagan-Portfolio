import type {Metadata} from 'next';
import {site} from './site';
import {durations,prices,services} from './catalog';

// Per-page search and link-preview details. Next merges metadata shallowly, so each page sets its
// whole openGraph and twitter blocks here rather than inheriting part of the layout's.
// Share images live in public/og (1200×630), one per page.
export const SITE_NAME='Reagan Marfo';
export function pageMetadata({title,description,path,image='reagan-marfo',imageAlt,absoluteTitle=false,index=true}:{title:string;description:string;path:string;image?:string;imageAlt?:string;absoluteTitle?:boolean;index?:boolean}):Metadata{
  const fullTitle=absoluteTitle?title:`${title} — ${SITE_NAME}`;
  const images=[{url:`/og/${image}.jpg`,width:1200,height:630,alt:imageAlt??fullTitle}];
  return {
    title:absoluteTitle?{absolute:title}:title,description,
    alternates:{canonical:path},
    openGraph:{title:fullTitle,description,url:path,siteName:SITE_NAME,type:'website',locale:'en_GB',images},
    twitter:{card:'summary_large_image',title:fullTitle,description,images:images.map(i=>i.url)},
    ...(index?{}:{robots:{index:false,follow:false}}),
  };
}

// Structured data so search engines know who the site is about and which profiles are Reagan’s.
export function personJsonLd(){
  const sameAs=[...site.socials.map(s=>s.href),site.podcast].filter((u):u is string=>!!u&&u.startsWith('https://'));
  return {
    '@context':'https://schema.org','@graph':[
      {'@type':'Person','@id':`${site.url}/#person`,name:'Reagan Marfo',alternateName:'Raygan',url:site.url,image:`${site.url}/og/reagan-marfo.jpg`,jobTitle:'Creative entrepreneur',
        description:'Ghanaian creative entrepreneur, product designer, podcast host and speaker telling stories, building communities and designing products.',email:`mailto:${site.email}`,
        knowsAbout:['Product design','UI/UX design','Podcasting','Entrepreneurship','Public speaking','Event hosting','Creative strategy'],
        worksFor:site.ventures.map(v=>({'@type':'Organization',name:v.name,url:v.href})),sameAs:[...new Set(sameAs)]},
      {'@type':'WebSite','@id':`${site.url}/#website`,url:site.url,name:SITE_NAME,publisher:{'@id':`${site.url}/#person`},inLanguage:'en-GB'},
    ],
  };
}

// The About page as Reagan's profile page.
export function profileJsonLd(){return {'@context':'https://schema.org','@type':'ProfilePage',url:`${site.url}/about`,name:'About — Becoming Reagan Marfo',mainEntity:{'@id':`${site.url}/#person`}}}

// Consulting sessions with their prices, so search engines can show what is offered.
export function consultingJsonLd(){return {'@context':'https://schema.org','@type':'Service',name:'Creative Consulting with Reagan Marfo',serviceType:'Creative and product design consulting',url:`${site.url}/consulting`,provider:{'@id':`${site.url}/#person`},areaServed:'Worldwide',
  hasOfferCatalog:{'@type':'OfferCatalog',name:'Strategy calls',itemListElement:services.flatMap(s=>durations.map(d=>({'@type':'Offer',name:`${s.title} — ${d}-minute strategy call`,description:s.description,price:prices[d],priceCurrency:'GHS',url:`${site.url}/consulting/book?service=${s.id}`})))}}}

// Renders structured data safely inside a script tag.
export const jsonLdScript=(data:object)=>({__html:JSON.stringify(data).replace(/</g,'\\u003c')});
