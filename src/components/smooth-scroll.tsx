'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import Lenis from 'lenis';

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | undefined;
    const syncDialog = () => {
      if (document.querySelector('dialog[open]')) lenis?.stop();
      else lenis?.start();
    };
    const configure = () => {
      lenis?.destroy();
      lenis = undefined;
      if (preference.matches) return;
      lenis = new Lenis({
        autoRaf: true,
        // Match Team Raygan's default wheel smoothing; preserve native touch.
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        prevent: node => !!node.closest('dialog, textarea, select, [data-lenis-prevent]'),
      });
      syncDialog();
    };
    configure();
    const dialogs = new MutationObserver(syncDialog);
    dialogs.observe(document.body, {subtree: true, attributes: true, attributeFilter: ['open']});
    preference.addEventListener('change', configure);
    return () => {
      dialogs.disconnect();
      preference.removeEventListener('change', configure);
      lenis?.destroy();
    };
  }, [pathname]);

  return null;
}
