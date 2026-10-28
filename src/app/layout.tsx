import type { Metadata } from 'next';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/oooh-baby';
import 'lenis/dist/lenis.css';
import './globals.css';
import {SmoothScroll} from '@/components/smooth-scroll';
import {SupportFab} from '@/components/support-fab';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url), title: { default:'Reagan Marfo — Creative Entrepreneur', template:'%s — Raygan' },
  description:'I’m Reagan Marfo, a creative entrepreneur building products, media, stories and communities.',
  // The link preview card (public/og.jpg): portrait, three lines from the hero and the signature.
  openGraph:{title:'Reagan Marfo — Creative Entrepreneur',description:'Building products, telling stories and growing communities. Created to Create.',type:'website',siteName:'Raygan',images:[{url:'/og.jpg',width:1200,height:630,alt:'Reagan Marfo, creative entrepreneur'}]},
  twitter:{card:'summary_large_image',title:'Reagan Marfo — Creative Entrepreneur',description:'Building products, telling stories and growing communities. Created to Create.',images:['/og.jpg']},
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}<SmoothScroll/><SupportFab/></body></html>;
}
