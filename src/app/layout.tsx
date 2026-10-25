import type { Metadata } from 'next';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/oooh-baby';
import 'lenis/dist/lenis.css';
import './globals.css';
import {SmoothScroll} from '@/components/smooth-scroll';
import {SupportFab} from '@/components/support-fab';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url), title: { default:'Raygan — Created to Create.', template:'%s — Raygan' },
  description:'Reagan Marfo, creative entrepreneur building products, media, stories and communities.',
  openGraph:{title:'Raygan — Created to Create.',description:'Products, media, stories and communities.',type:'website'},
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}<SmoothScroll/><SupportFab/></body></html>;
}
