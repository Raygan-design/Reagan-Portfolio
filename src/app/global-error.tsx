'use client';
import './globals.css';
import {LostPage} from '@/components/lost-page';
// Replaces the whole site, header included, when the root layout itself fails.
export default function GlobalError(){return <html lang="en-GB"><body><LostPage/></body></html>}
