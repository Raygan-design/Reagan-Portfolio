import { NextResponse } from 'next/server';
import { contactSchema, inquiryRecord } from '@/lib/validation';
import { database } from '@/lib/server/db';
import { checkOrigin, readJson, rateLimit, errorResponse, HttpError } from '@/lib/server/http';
import { emailEnquiry, sendEnquiryToDashForms } from '@/lib/server/enquiry-notifications';
// Each enquiry is saved, sent to its Dash Forms project and emailed to Reagan. It counts as received
// if any of the three succeeds, so one service being down never loses a message or asks for a resend.
export async function POST(request:Request){try{checkOrigin(request);const parsed=contactSchema.safeParse(await readJson(request));if(!parsed.success)throw new HttpError(400,parsed.error.issues[0].message);await rateLimit(request,'contact',5);const data=parsed.data;
  const channels=['database','dashforms','email'] as const;
  const results=await Promise.allSettled([database().from('inquiries').insert(inquiryRecord(data)).then(({error})=>{if(error)throw new Error(error.message)}),sendEnquiryToDashForms(data,new Date().toISOString()),emailEnquiry(data)]);
  results.forEach((r,i)=>{if(r.status==='rejected')console.error(`Enquiry ${channels[i]} delivery failed`,{kind:data.kind,reason:r.reason instanceof Error?r.reason.message:String(r.reason)})});
  if(results.every(r=>r.status==='rejected'))throw new HttpError(503,'Your message could not be sent. Please try again.');
  return NextResponse.json({ok:true},{status:201})}catch(error){return errorResponse(error)}}
