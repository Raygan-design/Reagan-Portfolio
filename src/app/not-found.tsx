import type {Metadata} from 'next';
import {LostPage} from '@/components/lost-page';
export const metadata:Metadata={title:{absolute:'Page not found — Reagan Marfo'},robots:{index:false,follow:true}};
export default function NotFound(){return <LostPage/>}
