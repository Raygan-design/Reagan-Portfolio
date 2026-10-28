import Link from 'next/link';
import type {Metadata} from 'next';
import {BackButton, LostPage} from '@/components/lost-page';
export const metadata:Metadata={title:{absolute:'Page not found — Reagan Marfo'},robots:{index:false,follow:true}};
export default function NotFound(){return <LostPage code="404 · Wrong turn" title={<>Oops. The Moving Man walked a little too far.</>}
  actions={<><Link href="/" className="button primary">RETURN HOME</Link><BackButton/></>}>
  <p>This page doesn’t exist, or it moved without telling anyone. Let’s get you back on the road.</p>
</LostPage>}
