import { z } from 'zod';
import {isPossiblePhoneNumber} from 'libphonenumber-js/min';
import { serviceIds } from './catalog';

export const contactSchema=z.object({
  kind:z.enum(['general','speaking']).default('general'),eventType:z.string().trim().max(160).optional(),
  name:z.string().trim().min(2).max(120),email:z.email().max(254),topic:z.string().trim().min(2).max(160).default('General enquiry'),message:z.string().trim().min(10).max(5000),website:z.string().max(0).optional(),
  company:z.string().trim().max(200).optional(),phone:z.string().trim().max(30).optional(),eventName:z.string().trim().max(200).optional(),
  eventDate:z.string().optional(),eventFormat:z.enum(['In person','Online','Hybrid']).optional(),location:z.string().trim().max(300).optional(),
  engagement:z.enum(['Speaking','Event hosting','Panel discussion','Moderating','Not sure yet']).optional(),audience:z.string().trim().max(500).optional(),
  budget:z.enum(['Yes','No','To be confirmed']).optional(),budgetAmount:z.string().max(20).optional(),currency:z.enum(['GHS','USD','GBP','EUR','NGN']).optional(),
}).superRefine((data,ctx)=>{
  if(data.phone&&!/^\+?[0-9\s()-]{7,30}$/.test(data.phone))ctx.addIssue({code:'custom',path:['phone'],message:'Enter a valid contact number.'});
  if(data.kind!=='speaking')return;
  for(const key of ['company','phone','eventName','eventType','eventDate','eventFormat','location','engagement','audience','budget'] as const){if(!data[key])ctx.addIssue({code:'custom',path:[key],message:'Please complete your event details.'})}
  if(data.eventDate){const d=new Date(data.eventDate+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(data.eventDate)||!Number.isFinite(+d)||d.toISOString().slice(0,10)!==data.eventDate||data.eventDate<new Date(Date.now()-86400000).toISOString().slice(0,10))ctx.addIssue({code:'custom',path:['eventDate'],message:'Choose a valid upcoming event date.'})}
  if(data.budget==='Yes'&&(!data.currency||!/^\d+(\.\d{1,2})?$/.test(data.budgetAmount||'')||Number(data.budgetAmount)<=0))ctx.addIssue({code:'custom',path:['budgetAmount'],message:'Enter your budget amount and currency.'});
});
export function inquiryRecord(data:z.infer<typeof contactSchema>){
  const {name,email,topic,message}=data;
  if(data.kind!=='speaking')return {name,email,topic,message:data.phone?`Phone: ${data.phone}\n\n${message}`:message};
  const details=[['Company / organisation',data.company],['Phone / WhatsApp',data.phone],['Event name',data.eventName],['Event type',data.eventType],['Event date',data.eventDate],['Format',data.eventFormat],['Location / time zone',data.location],['Engagement',data.engagement],['Audience / expected size',data.audience],['Budget available',data.budget],...(data.budget==='Yes'?[['Budget',`${data.currency} ${data.budgetAmount}`]]:[])];
  return {name,email,topic,message:details.map(([label,value])=>`${label}: ${value}`).join('\n')+'\n\nTopic, goals and event brief:\n'+message};
}
export function validTimezone(value:string){try{new Intl.DateTimeFormat('en-US',{timeZone:value});return true}catch{return false}}
// Resolve the visitor's wall-clock time in the selected IANA time zone, including DST.
export function zonedTime(date:string,time:string,zone:string):Date|null {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time)||!validTimezone(zone))return null;
  const target=new Date(`${date}T${time}:00Z`);if(!Number.isFinite(+target))return null;
  const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  function parts(d:Date){const p=Object.fromEntries(formatter.formatToParts(d).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`}
  let guess=+target;
  for(let i=0;i<4;i++){const observed=new Date(parts(new Date(guess))+':00Z');guess+=+target-+observed;}
  const result=new Date(guess);return parts(result)===`${date}T${time}`?result:null;
}
const availabilitySchema=z.object({date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),time:z.string().regex(/^\d{2}:\d{2}$/)});
export const bookingSchema=z.object({
  requestId:z.uuid(),service:z.enum(serviceIds),duration:z.union([z.literal(30),z.literal(60)]),
  name:z.string().trim().min(2).max(120),email:z.email().max(254),phone:z.union([z.literal(''),z.string().trim().regex(/^\+[0-9]{7,15}$/,'Enter a valid phone number with its country code.').refine(isPossiblePhoneNumber,'Check your phone number and country code.')]),
  timeZone:z.string().refine(validTimezone,'Choose a valid time zone.'),work:z.string().trim().min(3).max(3000),goal:z.string().trim().min(10).max(5000),
  selectedSlot:z.iso.datetime().optional(),availability:z.array(availabilitySchema).min(1).max(3),material:z.union([z.literal(''),z.url().max(2000).refine(v=>v.startsWith('https://'),'Use a secure https link.')]).default(''),website:z.string().max(0).optional(),
}).superRefine((data,ctx)=>{
  if(data.selectedSlot?data.availability.length!==1:data.availability.length!==3)ctx.addIssue({code:'custom',path:['availability'],message:data.selectedSlot?'Choose one available session.':'Choose three preferred options.'});
  const seen=new Set<string>();data.availability.forEach((a,i)=>{const d=zonedTime(a.date,a.time,data.timeZone);if(!d||+d<=Date.now())ctx.addIssue({code:'custom',path:['availability',i],message:'Choose a valid future date and time.'});const key=a.date+'T'+a.time;if(seen.has(key))ctx.addIssue({code:'custom',path:['availability',i],message:'Choose three different date and time options.'});seen.add(key)});
});
export type BookingInput=z.infer<typeof bookingSchema>;
