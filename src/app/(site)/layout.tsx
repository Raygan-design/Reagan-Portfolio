import { Header, Footer } from '@/components/chrome';
import {SectionReveal} from '@/components/section-reveal';
import {DailyCardJar} from '@/components/daily-card-jar';
export default function SiteLayout({children}:{children:React.ReactNode}){return <><Header/><main id="main">{children}</main><SectionReveal/><Footer/><DailyCardJar/></>}
