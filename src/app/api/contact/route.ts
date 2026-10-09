import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation';
import { database } from '@/lib/server/db';
import { checkOrigin, readJson, rateLimit, errorResponse, HttpError } from '@/lib/server/http';
export async function POST(request:Request){try{checkOrigin(request);const parsed=contactSchema.safeParse(await readJson(request));if(!parsed.success)throw new HttpError(400,'Please check your name, email, subject, and message.');await rateLimit(request,'contact',5);const {website:_,...data}=parsed.data;const {error}=await database().from('inquiries').insert(data);if(error)throw new HttpError(503,'Your message could not be saved. Please try again.');return NextResponse.json({ok:true},{status:201})}catch(error){return errorResponse(error)}}
