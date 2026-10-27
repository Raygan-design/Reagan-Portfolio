'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';

export function SupportFab() {
  const pathname = usePathname(), onSupportPage = pathname === '/support';
  const [tucked, setTucked] = useState(false);
  // Step out of the way while the footer is on screen, like the card jar.
  useEffect(() => {
    const footer = document.querySelector('footer');
    setTucked(false);
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setTucked(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);
  // The support page is where this button leads, so it isn't needed there.
  if (onSupportPage) return null;
  return <Link href="/support" className={`support-fab${tucked ? ' tucked' : ''}`} tabIndex={tucked ? -1 : undefined} aria-label="Keep moving — support Reagan’s journey">
    <span className="support-fab-portrait" aria-hidden="true"><span className="support-fab-character"/></span>
    <span className="support-fab-copy"><span className="support-fab-title">Keep moving</span><span className="support-fab-caption">A little fuel for the journey</span></span>
  </Link>;
}
