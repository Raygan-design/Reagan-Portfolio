import { Arrow } from '@/components/arrow';
import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact-form';
import { ExternalLink } from '@/components/chrome';
import { site } from '@/lib/site';
export const metadata:Metadata={title:'Contact'};
export default async function Contact({searchParams}:{searchParams:Promise<{topic?:string}>}){const {topic}=await searchParams;return <><section className="section contact-hero"><p className="eyebrow">CONTACT</p><h1>Let’s make something worth remembering.</h1></section><section className="section contact-content"><div><h2>What can I help with?</h2><p>Tell me about the project, event, opportunity or idea. I’ll get back to you with the best next step.</p><div className="contact-direct"><a href={`mailto:${site.email}`}>REAGAN@TEAMRAYGAN.COM</a>{site.socials.slice(0,3).map(s=><ExternalLink key={s.label} href={s.href}>{s.label.toUpperCase()} <Arrow/></ExternalLink>)}</div></div><ContactForm topic={typeof topic==='string'?topic.slice(0,160):''}/></section></>}
