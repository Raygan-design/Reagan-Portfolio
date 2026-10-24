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
  return <><div ref={scene} className="moving-scene" data-paused={paused} role="img" aria-label="An illustrated traveller in purple walking along his creative journey">
    <span className="moving-annotation handwritten">Still moving. Still creating.</span>
    <div className="moving-sun"/><div className="moving-hill"/><div className="moving-road"/>
    <div className="moving-traveller" aria-hidden="true"/>
    <span className="moving-destination">On to the next idea</span>
  </div><button type="button" className="moving-toggle" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? 'Resume motion' : 'Pause motion'}</button></>;
}
