'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

export function SupportFab() {
  const onSupportPage = usePathname() === '/support';
  return <Link href={onSupportPage ? '#support-fuel' : '/support'} className="support-fab" aria-label="Keep moving — support Reagan’s journey">
    <span className="support-fab-portrait" aria-hidden="true"><span className="support-fab-character"/></span>
    <span className="support-fab-copy"><span className="support-fab-title">Keep moving</span><span className="support-fab-caption">A little fuel for the journey</span></span>
  </Link>;
}
