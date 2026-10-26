import 'server-only';
import {database,ConfigurationError} from './db';
import {HttpError} from './http';
import {openCalendarToken} from '../calendar-crypto';
import {consultationSlots,type BusyTime} from '../calendar-policy';
export const CALENDAR_OWNER='raymarfo184@gmail.com';
export const CALENDAR_REDIRECT='https://www.reaganmarfo.com/api/calendar/callback';
export const CALENDAR_SCOPES=['openid','email','https://www.googleapis.com/auth/calendar.events.owned','https://www.googleapis.com/auth/calendar.freebusy'];
export function googleConfig(){
 const id=process.env.GOOGLE_CLIENT_ID,secret=process.env.GOOGLE_CLIENT_SECRET,key=process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
 if(!id||!secret||!key||Buffer.from(key,'base64').length!==32)throw new ConfigurationError('The calendar connection is not ready.');
 return {id,secret,key};
}
export async function calendarConnected(){
 const {data,error}=await database().from('calendar_connections').select('id').eq('id','consultations').maybeSingle();
 if(error)throw new HttpError(503,'Calendar availability is temporarily unavailable.');return !!data;
}
export async function googleTokens(values:Record<string,string>){
 const {id,secret}=googleConfig();
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:id,client_secret:secret,...values}),cache:'no-store',signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new HttpError(503,'Google Calendar needs to be reconnected.');
 return await response.json() as {access_token:string;refresh_token?:string;scope?:string};
}
async function calendarAccess(){
 const {data,error}=await database().from('calendar_connections').select('encrypted_refresh_token,owner_email').eq('id','consultations').single();
 if(error||!data||data.owner_email!==CALENDAR_OWNER)throw new HttpError(503,'Calendar availability is not connected yet.');
 const token=openCalendarToken(data.encrypted_refresh_token,googleConfig().key);
 return (await googleTokens({grant_type:'refresh_token',refresh_token:token})).access_token;
}
export async function calendarRequest<T>(path:string,body?:unknown,method?:string):Promise<T>{
 const access=await calendarAccess();
 const response=await fetch(`https://www.googleapis.com/calendar/v3${path}`,{method:method||(body?'POST':'GET'),headers:{Authorization:`Bearer ${access}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new HttpError([404,409].includes(response.status)?response.status:503,'Calendar scheduling is temporarily unavailable.');return response.json();
}
export async function availableSlots(date:string,duration:30|60,excludeReference?:string){
 const start=new Date(`${date}T00:00:00Z`),end=new Date(+start+86400000);
 const result=await calendarRequest<{calendars:Record<string,{busy:BusyTime[];errors?:unknown[]}>}>('/freeBusy',{timeMin:new Date(+start-1800000).toISOString(),timeMax:new Date(+end+1800000).toISOString(),items:[{id:CALENDAR_OWNER}]});
 const calendar=result.calendars[CALENDAR_OWNER];if(!calendar||calendar.errors?.length)throw new HttpError(503,'Could not check calendar availability.');
 let query=database().from('consultation_slots').select('start_at,end_at,status,expires_at').in('status',['held','confirmed']).lt('start_at',end.toISOString()).gt('blocked_until',start.toISOString());
 if(excludeReference)query=query.neq('reference',excludeReference);
 const {data,error}=await query;if(error)throw new HttpError(503,'Could not check reserved sessions.');
 const held=(data||[]).filter(s=>s.status==='confirmed'||+new Date(s.expires_at)>Date.now()).map(s=>({start:s.start_at,end:s.end_at}));
 return consultationSlots(date,duration,[...calendar.busy,...held]);
}
