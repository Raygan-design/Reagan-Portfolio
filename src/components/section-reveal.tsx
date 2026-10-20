'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

export function SectionReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;

    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches || entry.target.contains(document.activeElement)) continue;
        const animation = entry.target.animate(
          [
            {opacity: 0.3, transform: 'translateY(8px)'},
            {opacity: 1, transform: 'translateY(0)'},
          ],
          {duration: 500, easing: 'cubic-bezier(0.22, 1, 0.36, 1)'},
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, {threshold: 0, rootMargin: '0px 0px -24px 0px'});

    // Content remains visible by default; only sections below the fold animate.
    document.querySelectorAll('#main > section, #main > .home-film').forEach(section => {
      if (section.querySelector('form') || section.getBoundingClientRect().top < window.innerHeight) return;
      observer.observe(section);
    });

    const finish = () => {
      animations.forEach(animation => animation.finish());
      animations.clear();
    };
    const onPreference = () => {
      if (preference.matches) {
        observer.disconnect();
        finish();
      }
    };
    preference.addEventListener('change', onPreference);
    document.addEventListener('focusin', finish);
    return () => {
      observer.disconnect();
      finish();
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('focusin', finish);
    };
  }, [pathname]);

  return null;
}
