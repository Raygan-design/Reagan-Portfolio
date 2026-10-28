import type { Metadata } from 'next';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/oooh-baby';
import 'lenis/dist/lenis.css';
import './globals.css';
import {SmoothScroll} from '@/components/smooth-scroll';
import {SupportFab} from '@/components/support-fab';
import { site } from '@/lib/site';
import { pageMetadata, personJsonLd, SITE_NAME } from '@/lib/seo';

const {alternates:_canonical,...defaults}=pageMetadata({title:'Reagan Marfo (Raygan) — Creative Entrepreneur & Podcast Host',absoluteTitle:true,path:'/',description:'I’m Reagan Marfo, a Ghanaian creative entrepreneur telling stories, building communities and designing products. Podcast host, speaker and product designer.'});
export const metadata: Metadata = {
  // Defaults for any page without its own; each page sets its own canonical link.
  ...defaults,
  metadataBase: new URL(site.url), title: { default:'Reagan Marfo — Creative Entrepreneur', template:'%s — Reagan Marfo' },
  applicationName:SITE_NAME,authors:[{name:'Reagan Marfo',url:site.url}],creator:'Reagan Marfo',
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en-GB"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(personJsonLd()).replace(/</g,'\\u003c')}}/><a className="skip-link" href="#main">Skip to content</a>{children}<SmoothScroll/><SupportFab/></body></html>;
}
