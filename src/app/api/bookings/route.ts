import { bookingBody } from '@/lib/server/booking-body';
import { attachmentTypes } from '@/lib/attachments';
import { randomBytes, randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { bookingSchema, zonedTime } from '@/lib/validation';
import { priceInPesewas, serviceById } from '@/lib/catalog';
import { database } from '@/lib/server/db';
import { paystack, paystackKey, hashToken } from '@/lib/server/paystack';
import { checkOrigin, rateLimit, errorResponse, HttpError } from '@/lib/server/http';
export async function POST(request:Request){try{
  const base=checkOrigin(request);const body=await bookingBody(request);const parsed=bookingSchema.safeParse(body.input);if(!parsed.success)throw new HttpError(400,parsed.error.issues[0].message);paystackKey();await rateLimit(request,'booking',10);
  const input=parsed.data,db=database(),jar=await cookies();
  const {data:existing,error:findError}=await db.from('bookings').select('*').eq('request_id',input.requestId).maybeSingle();if(findError)throw new HttpError(503,'Could not retrieve your booking.');
  let order=existing;
  if(order){if(!jar.get('raygan_booking')?.value||hashToken(jar.get('raygan_booking')!.value)!==order.access_hash)throw new HttpError(409,'This booking belongs to a different browser session. Please start a new booking.');if(order.status==='paid')throw new HttpError(409,'This booking has already been paid.');if(order.amount!==priceInPesewas(input.duration))throw new HttpError(409,'Session pricing has changed. Please go back and choose your session again.');if(order.checkout_url)return NextResponse.json({url:order.checkout_url});}
  else{
    const token=randomBytes(32).toString('hex'),reference=`raygan_${randomUUID().replaceAll('-','')}`;
    const {data,error}=await db.from('bookings').insert({request_id:input.requestId,reference,access_hash:hashToken(token),service:input.service,duration:input.duration,amount:priceInPesewas(input.duration),currency:'GHS',name:input.name,email:input.email,phone:input.phone,time_zone:input.timeZone,work:input.work,goal:input.goal,material:input.material,availability:input.availability.map(a=>({...a,utc:zonedTime(a.date,a.time,input.timeZone)!.toISOString()})),status:'pending'}).select('*').single();
    if(error||!data)throw new HttpError(409,'Your booking could not be created. Please try again.');order=data;
    jar.set('raygan_booking',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*7});
  }
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
  const checkout=await paystack<{authorization_url:string}>('/transaction/initialize',{email:order.email,amount:order.amount,currency:'GHS',reference:order.reference,callback_url:`${base}/consulting/confirmation?reference=${order.reference}`,metadata:{service:serviceById(order.service)?.title,duration:order.duration,cancel_action:`${base}/consulting/book?service=${encodeURIComponent(order.service)}`}});
  const url=new URL(checkout.authorization_url);if(url.protocol!=='https:'||!(url.hostname==='checkout.paystack.com'||url.hostname.endsWith('.paystack.com')))throw new HttpError(502,'The payment provider returned an invalid checkout link.');
  const {error:saveError}=await db.from('bookings').update({checkout_url:url.href}).eq('reference',order.reference);if(saveError)throw new HttpError(503,'Checkout could not be saved. Please try again.');return NextResponse.json({url:url.href});
}catch(error){return errorResponse(error)}}
