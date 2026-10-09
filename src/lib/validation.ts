import { z } from 'zod';
import { serviceIds } from './catalog';

export const contactSchema=z.object({name:z.string().trim().min(2).max(120),email:z.email().max(254),topic:z.string().trim().min(2).max(160),message:z.string().trim().min(10).max(5000),website:z.string().max(0).optional()});
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
  name:z.string().trim().min(2).max(120),email:z.email().max(254),phone:z.string().trim().regex(/^\+?[0-9\s()-]{7,25}$/,'Enter a valid WhatsApp number.'),
  timeZone:z.string().refine(validTimezone,'Choose a valid time zone.'),work:z.string().trim().min(3).max(3000),goal:z.string().trim().min(10).max(5000),
  availability:z.array(availabilitySchema).length(3),material:z.union([z.literal(''),z.url().max(2000).refine(v=>v.startsWith('https://'),'Use a secure https link.')]).default(''),website:z.string().max(0).optional(),
}).superRefine((data,ctx)=>{
  const seen=new Set<string>();data.availability.forEach((a,i)=>{const d=zonedTime(a.date,a.time,data.timeZone);if(!d||+d<=Date.now())ctx.addIssue({code:'custom',path:['availability',i],message:'Choose a valid future date and time.'});const key=a.date+'T'+a.time;if(seen.has(key))ctx.addIssue({code:'custom',path:['availability',i],message:'Choose three different date and time options.'});seen.add(key)});
});
export type BookingInput=z.infer<typeof bookingSchema>;
