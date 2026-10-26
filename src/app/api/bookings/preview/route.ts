import {randomBytes} from 'node:crypto';
import {NextResponse} from 'next/server';
import {bookingSchema} from '@/lib/validation';
import {priceInPesewas} from '@/lib/catalog';
import {consultationConfirmation,type PaidBooking} from '@/lib/booking-notifications';
import {checkOrigin,errorResponse,HttpError,rateLimit,readJson} from '@/lib/server/http';
import {validPrivateBookingToken} from '@/lib/server/private-booking-test';

export async function POST(request:Request){try{
 checkOrigin(request);await rateLimit(request,'booking-preview',5);
 const body=await readJson(request);if(!validPrivateBookingToken(body.token))throw new HttpError(404,'This private preview link is not available.');
 const parsed=bookingSchema.safeParse(body.input);if(!parsed.success)throw new HttpError(400,parsed.error.issues[0].message);
 const input=parsed.data;if(!input.selectedSlot)throw new HttpError(400,'Choose an available appointment time.');
 const booking:PaidBooking={reference:`raygan_${randomBytes(16).toString('hex')}`,status:'paid',name:input.name,email:input.email,phone:input.phone,service:input.service,duration:input.duration,amount:priceInPesewas(input.duration),currency:'GHS',time_zone:input.timeZone,work:input.work,goal:input.goal,material:input.material,availability:input.availability,paid_at:new Date().toISOString(),scheduled_start:input.selectedSlot,scheduled_end:new Date(+new Date(input.selectedSlot)+input.duration*60000).toISOString(),schedule_status:'confirmed',meeting_url:'https://meet.google.com/landing'};
 const key=process.env.RESEND_API_KEY,from=process.env.SUPPORT_EMAIL_FROM;if(!key||!from)throw new HttpError(503,'Test email delivery is not connected.');
 const message=consultationConfirmation(booking);
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`consultation-preview/${booking.reference}`},body:JSON.stringify({from,to:[booking.email],reply_to:'reagan@teamraygan.com',...message,subject:`[TEST PREVIEW] ${message.subject}`}),signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new HttpError(503,'The test confirmation email could not be sent.');
 return NextResponse.json({receipt:{service:booking.service,duration:booking.duration,amount:booking.amount,timeZone:booking.time_zone,availability:booking.availability,email:booking.email}},{headers:{'Cache-Control':'no-store'}});
}catch(error){return errorResponse(error)}}
