import type {Metadata} from 'next';
import {SupportAmount} from '@/components/support-amount';
import {MovingMan} from '@/components/moving-man';

export const metadata: Metadata = {title: 'Keep the Moving Man going', description: 'Put a little fuel in Reagan’s creative journey.'};

export default function Support() {
  return <div className="page-entrance support-page">
    <section className="section support-intro">
      <p className="eyebrow">A little fuel for the journey</p>
      <h1>Keep the<br/><span className="hero-underline">Moving Man</span> going.</h1>
      <div className="support-layout">
        <div><p className="support-description">If something I’ve shared has helped you, you can put a little fuel in the journey.</p><MovingMan/><div className="support-scene-caption"><span>The journey continues</span><span>One step at a time</span></div></div>
        <div className="support-contribution"><h2>A little goes a long way.</h2><p>Put a little fuel in what comes next. Every contribution is a little nudge forward.</p><SupportAmount/></div>
      </div>
      <div className="support-closing"><p>And yes, some of that fuel might be used for a nap.</p><span className="handwritten">Created to Create.</span></div>
    </section>
  </div>;
}
