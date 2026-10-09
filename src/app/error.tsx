'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main id="main" className="section"><h1>Something went wrong.</h1><p>Please try again.</p><button className="button" onClick={reset}>TRY AGAIN</button></main>}
