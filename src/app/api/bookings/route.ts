export const maxDuration=60;
import { bookingBody } from '@/lib/server/booking-body';
import { attachmentTypes } from '@/lib/attachments';
import { randomBytes, randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { bookingSchema, zonedTime } from '@/lib/validation';
import { checkoutAmountInPesewas, priceInPesewas, serviceById } from '@/lib/catalog';
import { database } from '@/lib/server/db';
import { paystack, paystackKey, hashToken } from '@/lib/server/paystack';
import { checkOrigin, rateLimit, errorResponse, HttpError } from '@/lib/server/http';
import {availableSlots,calendarConnected} from '@/lib/server/google-calendar';
import {isConsultationSlot} from '@/lib/calendar-policy';
import {validPrivateBookingToken} from '@/lib/server/private-booking-test';
export async function POST(request:Request){try{
  const base=checkOrigin(request);const body=await bookingBody(request);const parsed=bookingSchema.safeParse(body.input);if(!parsed.success)throw new HttpError(400,parsed.error.issues[0].message);paystackKey();await rateLimit(request,'booking',10);
  const input=parsed.data,testPayment=validPrivateBookingToken(body.input&&typeof body.input==='object'?'testPaymentToken' in body.input?(body.input as {testPaymentToken?:unknown}).testPaymentToken:undefined:undefined),checkoutAmount=checkoutAmountInPesewas(input.duration,testPayment),db=database(),jar=await cookies();
  const {data:existing,error:findError}=await db.from('bookings').select('*').eq('request_id',input.requestId).maybeSingle();if(findError)throw new HttpError(503,'Could not retrieve your booking.');
  let order=existing;
  if(order){if(!jar.get('raygan_booking')?.value||hashToken(jar.get('raygan_booking')!.value)!==order.access_hash)throw new HttpError(409,'This booking belongs to a different browser session. Please start a new booking.');if(order.status==='paid')throw new HttpError(409,'This booking has already been paid.');if(order.amount!==checkoutAmount)throw new HttpError(409,'Session pricing has changed. Please go back and choose your session again.');if(order.checkout_url&&!order.scheduled_start)return NextResponse.json({url:order.checkout_url,reference:order.reference});}
  else{
    const connected=await calendarConnected();
    if(connected&&!input.selectedSlot)throw new HttpError(409,'The calendar is ready. Refresh this page and choose an available session.');
    if(input.selectedSlot){
      if(!connected||!isConsultationSlot(input.selectedSlot,input.duration))throw new HttpError(409,'Please choose an available weekday session.');
      const local=zonedTime(input.availability[0].date,input.availability[0].time,input.timeZone);
      if(local?.toISOString()!==input.selectedSlot)throw new HttpError(400,'Your selected time does not match the appointment.');
    }
    const token=randomBytes(32).toString('hex'),reference=`raygan_${randomUUID().replaceAll('-','')}`;
    const {data,error}=await db.from('bookings').insert({request_id:input.requestId,reference,access_hash:hashToken(token),service:input.service,duration:input.duration,amount:checkoutAmount,currency:'GHS',name:input.name,email:input.email,phone:input.phone,time_zone:input.timeZone,work:input.work,goal:input.goal,material:input.material,availability:input.availability.map(a=>({...a,utc:zonedTime(a.date,a.time,input.timeZone)!.toISOString()})),status:'pending',...(input.selectedSlot?{scheduled_start:input.selectedSlot,scheduled_end:new Date(+new Date(input.selectedSlot)+input.duration*60000).toISOString(),schedule_status:'pending'}:{})}).select('*').single();
    if(error||!data)throw new HttpError(409,'Your booking could not be created. Please try again.');order=data;
    jar.set('raygan_booking',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*7});
  }
  if(order.scheduled_start){
    const slots=await availableSlots(order.scheduled_start.slice(0,10),order.duration,order.reference);
    if(!slots.includes(new Date(order.scheduled_start).toISOString()))throw new HttpError(409,'That time is no longer available. Go back and choose another time.');
    const {data:held,error:holdError}=await db.rpc('hold_consultation_slot',{booking_ref:order.reference,slot_start:order.scheduled_start,slot_end:order.scheduled_end});
    if(holdError||!held)throw new HttpError(409,'Someone else has just reserved that time. Go back and choose another time.');
  }
  if(order.checkout_url)return NextResponse.json({url:order.checkout_url,reference:order.reference});
  if(body.files.length&&!(order.attachments?.length)){
    const uploaded:{name:string;path:string;size:number}[]=[];
    try{
      for(const [index,file] of body.files.entries()){
        const extension=file.name.split('.').pop()!.toLowerCase(),path=`${order.reference}/${index}.${extension}`;
        const {error}=await db.storage.from('booking-materials').upload(path,file,{contentType:attachmentTypes[extension],upsert:true});
        if(error)throw new HttpError(503,'Your files could not be uploaded. Please try again.');uploaded.push({name:file.name.slice(0,200),path,size:file.size});
      }
      const {error}=await db.from('bookings').update({attachments:uploaded}).eq('reference',order.reference);
      if(error)throw new HttpError(503,'Your attachments could not be saved. Please try again.');
    }catch(error){if(uploaded.length)await db.storage.from('booking-materials').remove(uploaded.map(f=>f.path));throw error}
  }
  const checkout=await paystack<{authorization_url:string}>('/transaction/initialize',{email:order.email,amount:order.amount,currency:'GHS',reference:order.reference,callback_url:`${base}/consulting/confirmation?reference=${order.reference}&service=${encodeURIComponent(order.service)}`,metadata:{service:serviceById(order.service)?.title,duration:order.duration,listed_price:priceInPesewas(order.duration),private_test:testPayment||undefined,cancel_action:`${base}/consulting/book?service=${encodeURIComponent(order.service)}&cancelled=1`}});
  const url=new URL(checkout.authorization_url);if(url.protocol!=='https:'||!(url.hostname==='checkout.paystack.com'||url.hostname.endsWith('.paystack.com')))throw new HttpError(502,'The payment provider returned an invalid checkout link.');
  const {error:saveError}=await db.from('bookings').update({checkout_url:url.href}).eq('reference',order.reference);if(saveError)throw new HttpError(503,'Checkout could not be saved. Please try again.');return NextResponse.json({url:url.href,reference:order.reference});
}catch(error){return errorResponse(error)}}
