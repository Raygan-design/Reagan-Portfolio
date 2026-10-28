'use client';
import './globals.css';
import {LostPage, RefreshButton} from '@/components/lost-page';
// Replaces the whole site, header included, when the root layout itself fails.
export default function GlobalError(){return <html lang="en-GB"><body><LostPage code="Oops · Something slipped" title={<>Maybe your internet wandered a little too far.</>}
  actions={<><RefreshButton/><a href="/" className="button">RETURN HOME</a></>}>
  <p>Or we tripped over something on our side. Either way, we’re on it.</p>
  <p>In the meantime, give the page a quick refresh. That usually brings everyone back.</p>
</LostPage></body></html>}
