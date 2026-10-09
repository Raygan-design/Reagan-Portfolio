import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
export default function sitemap():MetadataRoute.Sitemap{return ['','/about','/speaking','/consulting','/contact'].map(path=>({url:site.url+path}))}
