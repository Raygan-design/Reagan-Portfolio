import {notFound} from 'next/navigation';
// Lets the error page be seen on preview deployments; the live site answers with the 404 page.
export const dynamic='force-dynamic';
export default function PreviewError(){if(process.env.VERCEL_ENV==='production')notFound();throw new Error('Preview of the error page.')}
