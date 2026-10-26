import {NextResponse} from 'next/server';
import {availableDates,availableSlots,calendarConnected} from '@/lib/server/google-calendar';
import {rateLimit,HttpError,errorResponse} from '@/lib/server/http';
import {consultationSlots} from '@/lib/calendar-policy';
export async function GET(request:Request){try{
 await rateLimit(request,'calendar-availability',100);
 const connected=await calendarConnected();if(!connected)return NextResponse.json({connected:false},{headers:{'Cache-Control':'no-store'}});
 const url=new URL(request.url),date=url.searchParams.get('date'),month=url.searchParams.get('month'),duration=Number(url.searchParams.get('duration'));
 if(!date&&!month)return NextResponse.json({connected:true},{headers:{'Cache-Control':'no-store'}});
 if(month){
  if(!/^\d{4}-\d{2}$/.test(month)||![30,60].includes(duration))throw new HttpError(400,'Choose a valid month and session length.');
  const valid=new Date(`${month}-01T12:00:00Z`);if(!Number.isFinite(+valid)||valid.toISOString().slice(0,7)!==month)throw new HttpError(400,'Choose a valid month.');
  const dates=await availableDates(month,duration as 30|60);
  return NextResponse.json({connected:true,dates},{headers:{'Cache-Control':'no-store'} });
 }
 if(!date)throw new HttpError(400,'Choose a valid date.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||![30,60].includes(duration))throw new HttpError(400,'Choose a valid date and session length.');
 // Validate the calendar date before querying Google; weekends return an empty list.
 const valid=new Date(`${date}T12:00:00Z`);if(!Number.isFinite(+valid)||valid.toISOString().slice(0,10)!==date)throw new HttpError(400,'Choose a valid date.');
 const slots=consultationSlots(date,duration as 30|60,[]).length?await availableSlots(date,duration as 30|60):[];
 return NextResponse.json({connected:true,slots},{headers:{'Cache-Control':'no-store'}});
}catch(error){return errorResponse(error)}}
