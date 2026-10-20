import { Header, Footer } from '@/components/chrome';
import {SectionReveal} from '@/components/section-reveal';
export default function SiteLayout({children}:{children:React.ReactNode}){return <><Header/><main id="main">{children}</main><SectionReveal/><Footer/></>}
