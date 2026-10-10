import type { Metadata } from 'next';
import { ConsultingMenu } from '@/components/consulting';
export const metadata:Metadata={title:'Creative Consulting'};
export default function Consulting(){return <><section className="section consulting-hero"><div><p className="eyebrow">CREATIVE CONSULTING / ONE-TO-ONE</p><h1>A little clarity can change what comes next.</h1></div><div><p>Choose the conversation that fits the question in front of you.</p><p className="handwritten">Bring the question.</p></div></section><ConsultingMenu/></>}
