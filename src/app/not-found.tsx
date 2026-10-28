import Link from 'next/link';
import type {Metadata} from 'next';
export const metadata:Metadata={title:{absolute:'Page not found — Reagan Marfo'},robots:{index:false,follow:true}};
export default function NotFound(){return <main id="main" className="section not-found"><p className="eyebrow">404</p><h1>This page couldn’t be found.</h1><Link href="/" className="button">RETURN HOME</Link></main>}
