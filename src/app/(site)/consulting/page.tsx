import type { Metadata } from 'next';
import {pageMetadata} from '@/lib/seo';
import { ConsultingMenu } from '@/components/consulting';
export const metadata:Metadata=pageMetadata({title:'Creative Consulting',path:'/consulting',image:'consulting',description:'One-to-one sessions with Reagan Marfo on product design direction, podcast strategy, personal branding and turning a creative idea into a clear plan.'});
export default function Consulting(){return <div className="page-entrance" key="consulting"><section className="section consulting-hero"><div><p className="eyebrow">CREATIVE CONSULTING / ONE-TO-ONE</p><h1>A little clarity can change what comes next.</h1></div><div><p>Choose the conversation that fits the question in front of you.</p></div></section><ConsultingMenu/></div>}
