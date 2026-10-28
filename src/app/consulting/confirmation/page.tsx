import type { Metadata } from 'next';
import { Confirmation } from '@/components/confirmation';
import {serviceById} from '@/lib/catalog';
export const metadata:Metadata={title:'Booking confirmation',robots:{index:false,follow:false}};
export default async function ConfirmationPage({searchParams}:{searchParams:Promise<{reference?:string;trxref?:string;service?:string}>}){const params=await searchParams;const reference=typeof params.reference==='string'?params.reference:typeof params.trxref==='string'?params.trxref:'';return <Confirmation reference={reference} service={typeof params.service==='string'&&serviceById(params.service)?params.service:'podcast-strategy'}/>}
