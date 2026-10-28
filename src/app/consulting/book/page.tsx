import type { Metadata } from 'next';
import {pageMetadata} from '@/lib/seo';
import { Booking } from '@/components/booking';
import { serviceById, type ServiceId } from '@/lib/catalog';
export const metadata:Metadata=pageMetadata({title:'Book a session',path:'/consulting/book',image:'consulting',index:false,description:'Book a paid creative consulting session with Reagan Marfo.'});
export default async function BookPage({searchParams}:{searchParams:Promise<{service?:string;preview?:string;testPayment?:string;cancelled?:string;payment?:string}>}){const {service,preview,testPayment,cancelled,payment}=await searchParams;return <Booking initialService={(service&&serviceById(service)?service:'product-design') as ServiceId} previewToken={typeof preview==='string'?preview:undefined} testPaymentToken={typeof testPayment==='string'?testPayment:undefined} returnNotice={cancelled==='1'||payment==='failed'}/>}
