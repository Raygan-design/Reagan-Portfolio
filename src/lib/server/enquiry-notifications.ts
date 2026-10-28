import 'server-only';
import type {z} from 'zod';
import type {contactSchema} from '../validation';
import {ENQUIRY_CC,ENQUIRY_TO,dashFormsEnquiry,enquiryEmail} from '../enquiry-notifications';

// Dash Forms project endpoints; the env vars allow pointing at other projects without a deploy.
const DASHFORMS={
  general:process.env.DASHFORMS_CONTACT_URL||'https://api.dashforms.dev/projects/d68ac6f8',
  speaking:process.env.DASHFORMS_SPEAKING_URL||'https://api.dashforms.dev/projects/172467bb',
};
type Enquiry=z.infer<typeof contactSchema>;

export async function sendEnquiryToDashForms(data:Enquiry,submittedAt:string){
  const endpoint=DASHFORMS[data.kind==='speaking'?'speaking':'general'];
  if(new URL(endpoint).origin!=='https://api.dashforms.dev')throw new Error('Dash Forms endpoint is not configured.');
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(dashFormsEnquiry(data,submittedAt)),signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error(`Dash Forms rejected the enquiry (HTTP ${response.status}).`);
}

export async function emailEnquiry(data:Enquiry){
  const key=process.env.RESEND_API_KEY,from=process.env.SUPPORT_EMAIL_FROM;
  if(!key||!from)throw new Error('Enquiry email is not configured.');
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
    body:JSON.stringify({from,to:[ENQUIRY_TO],cc:[ENQUIRY_CC],reply_to:data.email,...enquiryEmail(data)}),signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error(`Enquiry email rejected by provider (HTTP ${response.status}).`);
}
