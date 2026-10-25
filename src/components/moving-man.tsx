'use client';

import {useSupportPayment} from './support-payment-provider';
import {useEffect, useRef, useState} from 'react';

// Pass a reference only after the server has verified a successful contribution.
export function MovingMan({verifiedPaymentReference}: {verifiedPaymentReference?: string}) {
  const payment = useSupportPayment();
  const confirmedReference = verifiedPaymentReference || payment.reference;
  const scene = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!confirmedReference) return;
    const animations = scene.current?.getAnimations({subtree: true}) ?? [];
    animations.forEach(animation => animation.updatePlaybackRate(2.5));
    const settle = window.setTimeout(() => {
      animations.forEach(animation => animation.updatePlaybackRate(1));
    }, 3600);
    return () => {
      window.clearTimeout(settle);
      animations.forEach(animation => animation.updatePlaybackRate(1));
    };
  }, [confirmedReference]);
  return <><div ref={scene} className="moving-scene" data-paused={paused} role="img" aria-label="An illustrated traveller in purple walking along a quiet neighborhood street as a car and bicycle pass behind him">
    <span className="moving-annotation handwritten">Still moving. Still creating.</span>
    <div className="moving-sky" aria-hidden="true"><span className="moving-cloud moving-cloud-one"/><span className="moving-cloud moving-cloud-two"/><span className="moving-sun"/></div>
    <svg className="moving-neighborhood" viewBox="0 0 1000 210" preserveAspectRatio="none" aria-hidden="true">
      <g className="moving-buildings">
        <path d="M0 196H1000M18 196V121h120v75M8 121l70-54 72 54M39 144h27v31H39zm56 0h25v31H95M177 196v-58h145v58m-159-58 86-66 90 66m-136 20h27v27h-27zm66 0h27v27h-27M371 196v-82h132v82m-12-82-54-43-78 43m36 22h25v29h-25zm61 0h24v29h-24M552 196v-61h146v61m-160-61 87-60 88 60m-135 21h27v28h-27zm66 0h27v28h-27M749 196v-72h147v72m-160-72 86-62 91 62m-136 20h27v31h-27zm65 0h27v31h-27M928 196v-50h72"/>
      </g>
      <g className="moving-trees">
        <path d="M158 198v-72m0 0c-23 1-33-18-21-31-8-18 8-34 25-27 16-12 37 4 28 22 14 15 0 37-20 32-3 7-7 9-12 4zm189 72v-67m0 0c-22 1-31-17-19-29-8-17 7-33 24-26 15-11 35 4 27 21 13 15 0 35-19 30-3 6-7 8-13 4zm182 67v-73m0 0c-23 1-33-18-20-31-8-18 8-34 25-27 16-12 37 4 28 22 14 16 0 37-20 32-3 7-7 9-13 4zm190 73v-65m0 0c-21 1-31-17-19-29-7-16 8-31 24-25 15-11 34 4 26 21 13 14 0 34-18 29-3 7-7 9-13 4zm201 65v-73m0 0c-23 1-33-18-20-31-8-18 8-34 25-27 16-12 37 4 28 22 14 16 0 37-20 32-3 7-7 9-13 4z"/>
      </g>
      <path className="moving-shrubs" d="M0 197c32-22 60-14 88 0m95 0c31-24 62-15 90 0m115 0c34-23 66-14 96 0m104 0c32-24 65-15 92 0m105 0c31-22 61-14 87 0m71 0c27-18 52-11 77 0"/>
    </svg>
    <div className="moving-road" aria-hidden="true"><span className="moving-road-edge"/><span className="moving-road-marks"/></div>
    <div className="moving-traffic" aria-hidden="true">
      <span className="moving-car"><i/><b/><em/></span>
      <span className="moving-bicycle"><i/><b/><em/><strong/></span>
    </div>
    <div className="moving-sidewalk" aria-hidden="true"><span/></div>
    <div className="moving-traveller" aria-hidden="true"/>
    <span className="moving-destination">On to the next idea</span>
  </div><button type="button" className="moving-toggle" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? 'Resume motion' : 'Pause motion'}</button></>;
}
