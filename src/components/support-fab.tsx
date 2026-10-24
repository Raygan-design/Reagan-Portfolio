import Link from 'next/link';

export function SupportFab() {
  return <Link href="/support" className="support-fab" aria-label="Keep moving — support Reagan’s journey">
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="19" cy="5" r="3"/><path d="m11 29 4-10 3-9 5 7 5 1M8 16l5-5 5-1M15 19l7 4 2 6"/></svg>
    <span>Keep moving</span>
  </Link>;
}
