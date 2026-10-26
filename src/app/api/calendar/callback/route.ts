import {timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {database} from '@/lib/server/db';
import {errorResponse,HttpError} from '@/lib/server/http';
import {sealCalendarToken} from '@/lib/calendar-crypto';
import {googleConfig,googleTokens,CALENDAR_OWNER,CALENDAR_REDIRECT,CALENDAR_SCOPES} from '@/lib/server/google-calendar';
export async function GET(request:Request){try{
 const url=new URL(request.url),jar=await cookies(),raw=jar.get('raygan_google_setup')?.value;jar.set('raygan_google_setup','',{path:'/api/calendar',maxAge:0,httpOnly:true,secure:true,sameSite:'lax'});
 let setup:{state:string;verifier:string};try{setup=JSON.parse(raw||'')}catch{throw new HttpError(403,'Start the calendar connection again from this browser.')}
 const state=url.searchParams.get('state')||'',code=url.searchParams.get('code');
 if(!code||!state||state.length!==setup.state.length||!timingSafeEqual(Buffer.from(state),Buffer.from(setup.state)))throw new HttpError(403,'The calendar connection could not be verified.');
 const tokens=await googleTokens({grant_type:'authorization_code',code,redirect_uri:CALENDAR_REDIRECT,code_verifier:setup.verifier});
 const profile=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:`Bearer ${tokens.access_token}`},cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!profile.ok)throw new HttpError(403,'Could not verify the calendar owner.');const owner=await profile.json();
 if(owner.email!==CALENDAR_OWNER||owner.email_verified!==true)throw new HttpError(403,'Please connect Reagan’s Google account.');
 if(!tokens.refresh_token||CALENDAR_SCOPES.filter(s=>s.startsWith('https://')).some(s=>!tokens.scope?.split(' ').includes(s)))throw new HttpError(403,'Please grant both calendar permissions to complete setup.');
 const {error}=await database().from('calendar_connections').insert({id:'consultations',owner_email:CALENDAR_OWNER,encrypted_refresh_token:sealCalendarToken(tokens.refresh_token,googleConfig().key)});
 if(error)throw new HttpError(409,'The calendar is already connected or could not be saved.');
 return NextResponse.redirect('https://www.reaganmarfo.com/calendar/connected',303);
}catch(error){return errorResponse(error)}}
