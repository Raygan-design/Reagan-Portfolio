'use client';
import Link from 'next/link';
import {LostPage, RefreshButton} from '@/components/lost-page';
export default function ErrorPage(){return <LostPage code="Oops · Something slipped" title={<>Maybe your internet wandered a little too far.</>}
  actions={<><RefreshButton/><Link href="/" className="button">RETURN HOME</Link></>}>
  <p>Or we tripped over something on our side. Either way, we’re on it.</p>
  <p>In the meantime, give the page a quick refresh. That usually brings everyone back.</p>
</LostPage>}
