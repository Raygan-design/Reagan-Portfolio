import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact-form';
export const metadata:Metadata={title:'Speaking & Hosting Enquiry'};
export default function SpeakingEnquiry(){return <><section className="section contact-hero"><p className="eyebrow">SPEAKING + EVENT HOSTING</p><h1>Let’s make your event worth remembering.</h1></section><section className="section contact-content"><div><h2>Tell me about your event.</h2><p>Share what you’re planning and the role you have in mind. I’ll get back to you about availability and the next steps.</p></div><ContactForm speaking/></section></>}
