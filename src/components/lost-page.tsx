'use client';
import Link from 'next/link';
import {preload} from 'react-dom';

// The one page shown when something goes missing or breaks: the Moving Man has walked off past the
// signpost home. Used by the 404, error and global error pages.
export function LostPage(){
  preload('/images/moving-man/walking-sprite.webp',{as:'image'});
  return <main id="main" className="lost-page">
    <Link href="/" className="wordmark lost-wordmark">REAGAN.</Link>
    <div className="lost-copy">
      <p className="eyebrow">404 · Wrong turn</p>
      <h1 className="display-heading">Oops. The Moving Man walked a little too far.</h1>
      <div className="lost-text"><p>This page doesn’t exist, or it moved without telling anyone. Let’s get you back on the road.</p></div>
      <div className="lost-actions"><a href="/" className="button primary">RETURN HOME</a></div>
    </div>
    <div className="lost-road" aria-hidden="true">
      <span className="lost-sign"><span>HOME</span></span>
      <span className="lost-traveller"/>
    </div>
  </main>;
}

