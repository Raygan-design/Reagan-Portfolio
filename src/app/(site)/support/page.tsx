import type {Metadata} from 'next';
import Link from 'next/link';
import {MovingMan} from '@/components/moving-man';
import {Arrow} from '@/components/arrow';

export const metadata: Metadata = {title: 'Keep the Moving Man going', description: 'More conversations. More ideas. More things worth creating. Support Reagan’s creative journey.'};

export default function Support() {
  return <div className="page-entrance support-page">
    <section className="section support-intro">
      <p className="eyebrow">A little fuel for the journey</p>
      <h1>Keep the<br/><span className="hero-underline">Moving Man</span> going.</h1>
      <p className="support-subhead">More conversations. More ideas.<br/>More things worth creating.</p>
      <div className="support-layout">
        <div><p className="support-description">If something I’ve shared has helped you, you can put a little fuel in the journey.</p><MovingMan/><div className="support-scene-caption"><span>The journey continues</span><span>One step at a time</span></div></div>
        <div className="support-contribution"><h2>A little goes a long way.</h2><p>Contributions will open soon. For now, thank you for being part of the journey.</p><button className="button primary" disabled>Contributions coming soon</button><p className="handwritten">Every bit means something.</p><Link href="/about" className="text-button">Back to my story <Arrow direction="left"/></Link></div>
      </div>
      <div className="support-closing"><p>And yes, some of that fuel might be used for a nap.</p><span className="handwritten">Created to Create.</span></div>
    </section>
  </div>;
}
