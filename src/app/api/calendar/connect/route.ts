import {randomBytes,createHash} from 'node:crypto';
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {checkOrigin,errorResponse,HttpError,rateLimit} from '@/lib/server/http';
import {calendarConnected,googleConfig,CALENDAR_OWNER,CALENDAR_REDIRECT,CALENDAR_SCOPES} from '@/lib/server/google-calendar';
export async function POST(request:Request){try{
 checkOrigin(request);await rateLimit(request,'calendar-connect',8);
 if(await calendarConnected())throw new HttpError(409,'The consultation calendar is already connected.');
 const {id}=googleConfig(),state=randomBytes(32).toString('base64url'),verifier=randomBytes(48).toString('base64url');
 const jar=await cookies();jar.set('raygan_google_setup',JSON.stringify({state,verifier}),{httpOnly:true,secure:true,sameSite:'lax',path:'/api/calendar',maxAge:600});
 const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');url.search=new URLSearchParams({client_id:id,redirect_uri:CALENDAR_REDIRECT,response_type:'code',scope:CALENDAR_SCOPES.join(' '),access_type:'offline',prompt:'consent',state,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256',login_hint:CALENDAR_OWNER}).toString();
 return NextResponse.redirect(url,303);
}catch(error){return errorResponse(error)}}
