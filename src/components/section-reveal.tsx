'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

// A calm, staggered rise: each block of a section (heading, then content) glides up
// 70px as it scrolls into view. The text turns solid early in the move so it never
// looks see-through, and the gentle curve keeps it from moving fast enough to smear.
const rise = 70, duration = 1100, stagger = 120, solidAt = .25;
const easing = 'cubic-bezier(0.25, 0.8, 0.3, 1)';

// The pieces of a section that rise one after another: unwrap single wrappers to reach its blocks.
function blocksOf(section: Element) {
  let el = section;
  for (let i = 0; i < 3 && el.children.length === 1; i++) el = el.children[0];
  return [...el.children].filter(child => (child as HTMLElement).offsetHeight > 0) as HTMLElement[];
}

export function SectionReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;

    const waiting = new Set<HTMLElement>();
    const animations = new Set<Animation>();
    const show = (el: HTMLElement) => { el.style.opacity = ''; waiting.delete(el); };

    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach((entry, i) => {
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        show(el);
        if (preference.matches || el.contains(document.activeElement)) return;
        const timing = {duration, delay: i * stagger, fill: 'backwards' as const};
        for (const animation of [
          el.animate([{transform: `translateY(${rise}px)`}, {transform: 'translateY(0)'}], {...timing, easing}),
          el.animate([{opacity: 0}, {opacity: 1, offset: solidAt}, {opacity: 1}], {...timing, easing: 'ease-out'}),
        ]) {
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        }
      });
    }, {threshold: 0, rootMargin: '0px 0px -60px 0px'});

    // Content remains visible by default; only sections below the fold animate.
    document.querySelectorAll('#main section').forEach(section => {
      if (section.querySelector('form') || section.getBoundingClientRect().top < window.innerHeight) return;
      for (const block of blocksOf(section)) {
        block.style.opacity = '0';
        waiting.add(block);
        observer.observe(block);
      }
    });

    const finish = () => {
      animations.forEach(animation => animation.finish());
      animations.clear();
      waiting.forEach(show);
      observer.disconnect();
    };
    // Keyboard focus: settle anything moving, and show a hidden block as soon as focus lands in it.
    const onFocus = (event: FocusEvent) => {
      animations.forEach(animation => animation.finish());
      animations.clear();
      waiting.forEach(el => { if (el.contains(event.target as Node)) { observer.unobserve(el); show(el); } });
    };
    const onPreference = () => { if (preference.matches) finish(); };
    preference.addEventListener('change', onPreference);
    document.addEventListener('focusin', onFocus);
    return () => {
      finish();
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('focusin', onFocus);
    };
  }, [pathname]);

  return null;
}
