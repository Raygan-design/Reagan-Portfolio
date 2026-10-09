import { NextResponse } from 'next/server';
import { validSignature } from '@/lib/payment-security';
import { paystackKey, verifyOrder } from '@/lib/server/paystack';
import { HttpError, errorResponse } from '@/lib/server/http';
export async function POST(request:Request){try{const raw=await request.text();if(Buffer.byteLength(raw)>100000)throw new HttpError(413,'Payload too large.');if(!validSignature(raw,request.headers.get('x-paystack-signature'),paystackKey()))throw new HttpError(401,'Invalid webhook signature.');let event;try{event=JSON.parse(raw)}catch{throw new HttpError(400,'Invalid payload.')}if(event.event==='charge.success'){const ref=event.data?.reference;if(typeof ref==='string'&&/^raygan_[a-f0-9]{32}$/.test(ref))await verifyOrder(ref);}return NextResponse.json({received:true})}catch(error){return errorResponse(error)}}
