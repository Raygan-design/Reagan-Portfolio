'use client';
import Link from 'next/link';

// The page shown when something goes missing or breaks: the Moving Man has walked off past the
// signpost home. Used by the 404, error and global error pages.
export function LostPage({code,title,children,actions}:{code:string;title:React.ReactNode;children:React.ReactNode;actions:React.ReactNode}){
  return <main id="main" className="lost-page">
    <Link href="/" className="wordmark lost-wordmark">REAGAN.</Link>
    <div className="lost-copy">
      <p className="eyebrow">{code}</p>
      <h1 className="display-heading">{title}</h1>
      <div className="lost-text">{children}</div>
      <div className="lost-actions">{actions}</div>
    </div>
    <div className="lost-road" aria-hidden="true">
      <span className="lost-sign"><span>HOME</span></span>
      <span className="lost-traveller"/>
    </div>
  </main>;
}

export function RefreshButton({primary=true}:{primary?:boolean}){return <button type="button" className={`button${primary?' primary':''}`} onClick={()=>window.location.reload()}>REFRESH THE PAGE</button>}
