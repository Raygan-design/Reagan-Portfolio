import { ScrollReveal } from '@/components/scroll-reveal';
import { Header, Footer } from '@/components/chrome';
export default function SiteLayout({children}:{children:React.ReactNode}){return <><Header/><main id="main">{children}</main><Footer/><ScrollReveal/></>}
