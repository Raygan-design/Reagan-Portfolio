'use client';

import {useSupportPayment} from './support-payment-provider';
import {useEffect, useId, useRef, useState} from 'react';

// Pass a reference only after the server has verified a successful contribution.
export function MovingMan({verifiedPaymentReference}: {verifiedPaymentReference?: string}) {
  const payment = useSupportPayment();
  const confirmedReference = verifiedPaymentReference || payment.reference;
  const scene = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const driverWindowId = useId();

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
      <svg className="moving-car" viewBox="0 0 220 92">
        <defs><clipPath id={driverWindowId}><path d="m43 34 21-21h53c7 0 12 3 17 9l9 12Z"/></clipPath></defs>
        <g className="vehicle-shadow"><ellipse cx="111" cy="78" rx="93" ry="7"/></g>
        <g className="vehicle-body">
          <path d="M17 66V43l15-7 24-23c5-5 11-7 19-7h45c10 0 17 4 23 12l14 19 39 6c12 2 20 9 20 21v6H17Z"/>
          <path className="vehicle-glass" d="m43 34 21-21h53c7 0 12 3 17 9l9 12Z"/>
          <g clipPath={`url(#${driverWindowId})`}><g className="vehicle-driver" transform="translate(0 7)">
            <path className="driver-shirt" d="M115 34q0-10 9-10h8l9 8 9-2 2 4Z"/>
            <path className="driver-skin" d="M124 25v-5h8v6m-7-6q-6-2-4-8 1-6 7-5 6 0 6 6l3 3-3 2v3Z"/>
            <path className="driver-hair" d="M121 14q-4-9 5-10 9-1 9 7l-5-1-2 5Z"/>
            <path className="driver-steering" d="m147 27 5 10"/>
            <circle cx="132" cy="13" r=".8" fill="#29232f" stroke="none"/>
          </g></g>
          <path className="vehicle-divider" d="M100 12v23m-58 0h104m-44 2v23m45-22 5 18M20 60h20m151 0h22"/>
          <path className="vehicle-detail" d="M68 42h11m34 0h11M37 54h16m134 0h18m-38-15 8 1"/>
          <path className="vehicle-bumper" d="M16 68h26m137 0h39"/>
          <path className="vehicle-tail-light" d="M18 43h9v9h-9Z"/>
          <path className="vehicle-light" d="M203 48h9l3 8h-12Z"/>
        </g>
        <g className="vehicle-wheel vehicle-wheel-one"><circle cx="64" cy="69" r="20"/><circle cx="64" cy="69" r="11"/><circle cx="64" cy="69" r="3"/><path d="M64 58v22M53 69h22m-19-8 16 16m0-16-16 16"/></g>
        <g className="vehicle-wheel vehicle-wheel-two"><circle cx="168" cy="69" r="20"/><circle cx="168" cy="69" r="11"/><circle cx="168" cy="69" r="3"/><path d="M168 58v22m-11-11h22m-19-8 16 16m0-16-16 16"/></g>
      </svg>
      <svg className="moving-bicycle" viewBox="0 -85 190 197">
        <g className="bicycle-shadow"><ellipse cx="96" cy="102" rx="83" ry="5"/></g>
        <g className="bicycle-wheel bicycle-wheel-one"><circle cx="42" cy="76" r="34"/><circle cx="42" cy="76" r="3"/><path d="M42 42v68M8 76h68M18 52l48 48m0-48-48 48M30 44l24 64m-44-20 64-24"/></g>
        <g className="bicycle-wheel bicycle-wheel-two"><circle cx="148" cy="76" r="34"/><circle cx="148" cy="76" r="3"/><path d="M148 42v68m-34-34h68m-58-24 48 48m0-48-48 48m12-56 24 64m-44-20 64-24"/></g>
        <g className="bicycle-frame">
          <path d="M42 76 74 42l29 34H42Zm32-34 45 4 29 30h-45L74 42Z"/>
          <path d="m103 76 17-51h22m-68 17-7-15m-15-3h26m62 2 13-9m-3-6 8 14M99 76h17m-9 0a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"/>
          <path className="bicycle-chain" d="M99 76h-41"/>
        </g>
        <g className="bicycle-rider">
          <path className="rider-far-leg" d="m73 17 14 31-5 27 11 3"/>
          <path className="rider-shirt" d="M68 19q3-22 25-36l15 5-13 24-11 14Z"/>
          <path className="rider-skin" d="m103-14 11 17 27 12 5-1 3 4-7 3-33-12-15-17Z"/>
          <path className="rider-skin" d="m102-18 3-10 11 4-4 13Z"/>
          <path className="rider-skin" d="M105-30q-7-6-2-15 5-7 14-3 6 3 5 10l4 4-5 2-1 8q-8 4-15-6Z"/>
          <path className="rider-helmet" d="M99-38q-5-16 10-19 14-2 18 13l-17-4-7 12Z"/>
          <path className="rider-helmet-detail" d="m105-49 13 3m-10-8 9 3m-13 15 6 13 9-5"/>
          <circle cx="119" cy="-36" r="1.1" fill="#29232f"/>
          <path className="rider-near-leg" d="m78 20 29 26-8 31"/>
          <path className="rider-shoe" d="m95 74 8 1 9 6q0 3-5 3H94Z"/>
        </g>
      </svg>
    </div>
    <div className="moving-sidewalk" aria-hidden="true"><span/></div>
    <div className="moving-traveller" aria-hidden="true"/>
    <span className="moving-destination">On to the next idea</span>
  </div><button type="button" className="moving-toggle" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? 'Resume motion' : 'Pause motion'}</button></>;
}
