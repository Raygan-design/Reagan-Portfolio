import 'server-only';
import {randomUUID} from 'node:crypto';
import {database} from './db';
import {HttpError} from './http';
import {availableSlots,calendarRequest,CALENDAR_OWNER} from './google-calendar';
import {serviceById} from '../catalog';
import type {PaidBooking} from '../booking-notifications';
type CalendarEvent={id:string;hangoutLink?:string;status?:string;extendedProperties?:{private?:{booking?:string}}};
export async function finalizeCalendarBooking(booking:PaidBooking):Promise<PaidBooking>{
 if(!booking.scheduled_start)return booking; // Existing preferred-time bookings stay manual.
 const db=database(),{data:current,error:readError}=await db.from('bookings').select('*').eq('reference',booking.reference).single();
 if(readError||!current)throw new HttpError(503,'Could not retrieve the appointment.');
 if(current.calendar_event_id||current.schedule_status==='needs_reschedule')return current;
 if(current.status!=='paid')throw new HttpError(409,'Payment is required before scheduling.');
 const token=randomUUID(),{data:claim,error}=await db.rpc('claim_booking_delivery',{booking_ref:booking.reference,delivery_channel:'calendar',delivery_token:token});
 if(error||claim!=='claimed')throw new HttpError(503,'Your calendar invitation is being prepared.');
 try{
  const id=`b${booking.reference.slice(7)}`,path=`/calendars/${encodeURIComponent(CALENDAR_OWNER)}/events`;
  let event:CalendarEvent|undefined;
  try{event=await calendarRequest<CalendarEvent>(`${path}/${id}`)}catch(e){if(!(e instanceof HttpError&&e.status===404))throw e}
  if(event&&(event.status==='cancelled'||event.extendedProperties?.private?.booking!==booking.reference))throw new HttpError(503,'The calendar invitation needs review.');
  let scheduleStatus='confirmed';
  if(!event){
   const slots=await availableSlots(new Date(current.scheduled_start).toISOString().slice(0,10),current.duration,booking.reference);
   const {data:held,error:holdError}=slots.includes(new Date(current.scheduled_start).toISOString())?await db.rpc('hold_consultation_slot',{booking_ref:booking.reference,slot_start:current.scheduled_start,slot_end:current.scheduled_end}):{data:false,error:null};
   if(holdError)throw new HttpError(503,'Could not reserve the appointment.');
   if(!held)scheduleStatus='needs_reschedule';
   else{
    try{event=await calendarRequest<CalendarEvent>(`${path}?sendUpdates=all&conferenceDataVersion=1`,{id,summary:`${serviceById(current.service)?.title} — ${current.name}`,description:'Paid Team Raygan consultation. Please contact reagan@teamraygan.com for changes.',start:{dateTime:current.scheduled_start,timeZone:'Africa/Accra'},end:{dateTime:current.scheduled_end,timeZone:'Africa/Accra'},attendees:[{email:current.email,displayName:current.name}],extendedProperties:{private:{booking:booking.reference}},conferenceData:{createRequest:{requestId:booking.reference,conferenceSolutionKey:{type:'hangoutsMeet'}}}})}catch(e){if(e instanceof HttpError&&e.status===409)event=await calendarRequest<CalendarEvent>(`${path}/${id}`);else throw e}
   }
  }
  const patch={schedule_status:scheduleStatus,calendar_event_id:event?.id||null,meeting_url:event?.hangoutLink||null};
  const {error:slotError}=await db.from('consultation_slots').update({status:event?'confirmed':'released'}).eq('reference',booking.reference);
  if(slotError)throw new HttpError(503,'Your appointment is being recorded.');
  const {error:updateError}=await db.from('bookings').update(patch).eq('reference',booking.reference);
  if(updateError)throw new HttpError(503,'Your invitation is being recorded.');
  const {error:sentError}=await db.from('booking_deliveries').update({status:'sent',sent_at:new Date().toISOString(),lease_token:null,lease_until:null}).eq('reference',booking.reference).eq('channel','calendar').eq('lease_token',token);
  if(sentError)throw new HttpError(503,'Your calendar delivery is being recorded.');
  return {...current,...patch};
 }catch(error){await db.from('booking_deliveries').update({status:'pending',lease_token:null,lease_until:null,last_error:'Calendar delivery pending'}).eq('reference',booking.reference).eq('channel','calendar').eq('lease_token',token);throw error}
}
