import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact-form';
import { site } from '@/lib/site';
export const metadata:Metadata={title:'Contact'};
export default function Contact(){return <div className="page-entrance" key="contact"><section className="section contact-hero"><p className="eyebrow">CONTACT</p><h1>Let’s make something worth remembering.</h1></section><section className="section contact-content"><div><h2>What can I help with?</h2><p>Tell me about the project, event, opportunity or idea. I’ll get back to you with the best next step.</p><div className="contact-direct"><a href={`mailto:${site.email}`}>REAGAN@TEAMRAYGAN.COM</a></div></div><ContactForm/></section></div>}
