import type { Metadata } from 'next';
import {pageMetadata} from '@/lib/seo';
import { ContactForm } from '@/components/contact-form';
import { site } from '@/lib/site';
export const metadata:Metadata=pageMetadata({title:'Contact',path:'/contact',image:'contact',description:'Get in touch with Reagan Marfo about a project, event, partnership or idea worth creating.'});
export default function Contact(){return <div className="page-entrance" key="contact"><section className="section contact-content"><div><p className="eyebrow">CONTACT</p><h1>What can I help with?</h1><p>Tell me about the project, event, opportunity or idea. I’ll get back to you with the best next step.</p><div className="contact-direct"><a href={`mailto:${site.email}`}>REAGAN@TEAMRAYGAN.COM</a></div></div><ContactForm/></section></div>}
