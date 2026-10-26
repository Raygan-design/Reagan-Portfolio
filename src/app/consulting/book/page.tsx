import type { Metadata } from 'next';
import { Booking } from '@/components/booking';
import { serviceById, type ServiceId } from '@/lib/catalog';
export const metadata:Metadata={title:'Book a session',robots:{index:false,follow:false}};
export default async function BookPage({searchParams}:{searchParams:Promise<{service?:string;preview?:string}>}){const {service,preview}=await searchParams;return <Booking initialService={(service&&serviceById(service)?service:'product-design') as ServiceId} previewToken={typeof preview==='string'?preview:undefined}/>}
