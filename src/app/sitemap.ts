import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
// Public pages for search engines; booking and confirmation steps stay out (see robots.ts).
const pages:[string,number][]=[['',1],['/about',.8],['/speaking',.9],['/speaking/enquiry',.7],['/consulting',.9],['/contact',.7],['/support',.5],['/privacy',.2]];
export default function sitemap():MetadataRoute.Sitemap{const lastModified=new Date();return pages.map(([path,priority])=>({url:site.url+path,lastModified,changeFrequency:'monthly',priority}))}
