'use client';
import { Arrow } from '@/components/arrow';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { site, safeExternalUrl } from '@/lib/site';

export function ExternalLink({href,children,className=''}:{href?:string;children:React.ReactNode;className?:string}) {
  const safe=safeExternalUrl(href);
  return safe ? <a className={className} href={safe} target="_blank" rel="noopener noreferrer">{children}<span className="sr-only"> (opens in a new tab)</span></a> : <span className={`${className} unavailable-link`} aria-disabled="true" title="Link will be available soon">{children}</span>;
}
export function Header() {
  const path=usePathname(); const dialog=useRef<HTMLDialogElement>(null);
  // Slide the menu back out before closing it (instant when reduced motion is on).
  const closeMenu=()=>{const d=dialog.current;if(!d?.open||d.classList.contains('closing'))return;if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.close();return}d.classList.add('closing');setTimeout(()=>{d.classList.remove('closing');d.close()},300)};
  useEffect(()=>{closeMenu()},[path]);
  const links=[['About','/about'],['Speaking','/speaking'],['Consulting','/consulting']];
  return <>
    <header className="site-header"><Link href="/" className="wordmark" aria-label="Raygan home">RAYGAN.</Link><nav className="desktop-nav" aria-label="Main navigation">{links.map(([label,href])=><Link key={label} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}</nav><div className="nav-actions"><Link className="button small" href="/contact">LET’S TALK <Arrow/></Link><button className="icon-button menu-toggle" aria-label="Open navigation" onClick={()=>dialog.current?.showModal()}><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 5h16M2 10h16M2 15h16" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></button></div></header>
    <dialog ref={dialog} className="navigation-dialog" onCancel={e=>{e.preventDefault();closeMenu()}} aria-label="Navigation"><div className="mobile-menu-header"><Link href="/" onClick={()=>closeMenu()} className="wordmark">RAYGAN.</Link><button autoFocus className="icon-button" aria-label="Close navigation" onClick={()=>closeMenu()}>×</button></div><nav aria-label="Mobile navigation" className="mobile-links">{links.map(([label,href])=><Link onClick={()=>closeMenu()} href={href} key={href}>{label}</Link>)}</nav><div className="mobile-menu-bottom"><Link onClick={()=>closeMenu()} className="button" href="/contact">LET’S TALK <Arrow/></Link><SocialLinks/><a href={`mailto:${site.email}`}>{site.email}</a><small>© Raygan. Created to Create.</small></div></dialog>
  </>;
}
export function SocialLinks(){return <div className="social-links">{site.socials.map(s=><ExternalLink key={s.label} href={s.href}>{s.label}</ExternalLink>)}</div>}
export function Footer(){const consulting=usePathname()==='/consulting';return <footer className="site-footer"><div className="footer-top"><div><p className="eyebrow">{consulting?'READY WHEN YOU ARE':'07 / NEXT'}</p><h2>{consulting?<>Start with the question<br/>in front of you.</>:<>Have something worth creating?</>}</h2></div><Link className="button inverse" href={consulting?'/consulting#sessions':'/contact'}>{consulting?<>CHOOSE A SESSION <Arrow/></>:'LET’S TALK'}</Link></div><div className="footer-bottom"><SocialLinks/><div className="footer-contact"><a href={`mailto:${site.email}`}>{site.email}</a><small>© Raygan. Created to Create.</small></div></div></footer>}
