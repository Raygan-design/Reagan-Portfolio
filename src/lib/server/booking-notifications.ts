import 'server-only';
import {randomUUID} from 'node:crypto';
import {database} from './db';
import {HttpError} from './http';
import {dashFormsBooking,consultationConfirmation,type PaidBooking} from '../booking-notifications';
import {finalizeCalendarBooking} from './calendar-booking';

type Channel='dashforms'|'email';
async function deliver(booking:PaidBooking,channel:Channel){
 const db=database(),token=randomUUID();
 const {data:claim,error}=await db.rpc('claim_booking_delivery',{booking_ref:booking.reference,delivery_channel:channel,delivery_token:token});
 if(error)throw new HttpError(503,'Booking delivery could not be queued.');
 if(claim==='sent')return;
 if(claim!=='claimed')throw new HttpError(503,'Booking delivery is already in progress.');
 try{
  if(channel==='dashforms'){
   const endpoint=process.env.DASHFORMS_BOOKINGS_URL;
   if(!endpoint||new URL(endpoint).origin!=='https://api.dashforms.dev')throw new HttpError(503,'The booking dashboard is not connected.');
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':`consultation/${booking.reference}`},body:JSON.stringify(dashFormsBooking(booking)),signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw new HttpError(503,'The booking dashboard delivery will be retried.');
  }else{
   const key=process.env.RESEND_API_KEY,from=process.env.SUPPORT_EMAIL_FROM;
   if(!key||!from)throw new HttpError(503,'Booking email delivery is not connected.');
   const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`consultation/${booking.reference}`},body:JSON.stringify({from,to:[booking.email],reply_to:'reagan@teamraygan.com',...consultationConfirmation(booking)}),signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw new HttpError(503,'Booking email delivery will be retried.');
  }
  const {error:sentError,data:sent}=await db.from('booking_deliveries').update({status:'sent',sent_at:new Date().toISOString(),lease_until:null,lease_token:null,last_error:null}).eq('reference',booking.reference).eq('channel',channel).eq('lease_token',token).select('status').single();
  if(sentError||!sent)throw new HttpError(503,'Booking delivery could not be recorded.');
 }catch(error){
  await db.from('booking_deliveries').update({status:'pending',lease_until:null,lease_token:null,last_error:error instanceof HttpError?`HTTP ${error.status}`:'Transport error'}).eq('reference',booking.reference).eq('channel',channel).eq('lease_token',token);
  throw error;
 }
}
export async function deliverBookingNotifications(booking:PaidBooking){
 booking=await finalizeCalendarBooking(booking);
 const results=await Promise.allSettled([deliver(booking,'dashforms'),deliver(booking,'email')]);
 if(results.some(r=>r.status==='rejected'))throw new HttpError(503,'Booking notifications will be retried.');
}
