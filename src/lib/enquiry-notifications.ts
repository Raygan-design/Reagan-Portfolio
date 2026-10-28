import type {z} from 'zod';
import type {contactSchema} from './validation';

// What happens with a contact or speaking enquiry besides saving it: a row in its Dash Forms
// project and an email to Reagan (copied to his personal inbox), with replies going straight to
// the visitor.
type Enquiry=z.infer<typeof contactSchema>;
export const ENQUIRY_TO='reagan@teamraygan.com',ENQUIRY_CC='raymarfo184@gmail.com';

// The rows sent to each Dash Forms project; keys match the fields set up in the dashboard.
export function dashFormsEnquiry(data:Enquiry,submittedAt:string){
  if(data.kind!=='speaking')return {name:data.name,email:data.email,phone:data.phone||'',topic:data.topic,message:data.message,submitted_at:submittedAt};
  return {
    name:data.name,email:data.email,phone:data.phone||'',organisation:data.company||'',event_name:data.eventName||'',event_type:data.eventType||'',
    event_date:data.eventDate||'',event_format:data.eventFormat||'',location:data.location||'',engagement:data.engagement||'',audience:data.audience||'',
    budget:data.budget==='Yes'?`${data.currency} ${data.budgetAmount}`:data.budget||'',topic:data.topic,event_brief:data.message,submitted_at:submittedAt,
  };
}

const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function enquiryEmail(data:Enquiry){
  const speaking=data.kind==='speaking';
  const subject=speaking?`Speaking enquiry: ${data.eventName} — ${data.name}`:`New message: ${data.topic} — ${data.name}`;
  const rows:[string,string|undefined][]=speaking?[
    ['Name',data.name],['Email',data.email],['Phone / WhatsApp',data.phone],['Organisation',data.company],['Event',data.eventName],['Event type',data.eventType],
    ['Date',data.eventDate],['Format',data.eventFormat],['Location / time zone',data.location],['Engagement',data.engagement],['Audience',data.audience],
    ['Budget',data.budget==='Yes'?`${data.currency} ${data.budgetAmount}`:data.budget],
  ]:[['Name',data.name],['Email',data.email],['Phone',data.phone],['Topic',data.topic]];
  const filled=rows.filter((r):r is [string,string]=>!!r[1]);
  const heading=speaking?'Topic, goals and event brief':'Message';
  const text=`${speaking?'New speaking & hosting enquiry':'New message from the website'}\n\n${filled.map(([k,v])=>`${k}: ${v}`).join('\n')}\n\n${heading}:\n${data.message}\n\nReply to this email to answer ${data.name} directly.`;
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(subject)}</title></head><body style="margin:0;background:#f6f5f9;color:#131313;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-top:6px solid #ad93ff"><tr><td style="padding:32px 28px"><p style="margin:0 0 28px;color:#080342;font-size:20px;font-weight:800">REAGAN.</p><p style="margin:0;font-size:11px;letter-spacing:2px;color:#080342;font-weight:bold">${speaking?'SPEAKING &amp; HOSTING ENQUIRY':'NEW MESSAGE'}</p><h1 style="font-size:28px;line-height:1.2;margin:12px 0 24px">${escape(speaking?data.eventName||data.name:data.topic)}</h1><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.5">${filled.map(([k,v])=>`<tr><td style="padding:8px 12px 8px 0;color:#62616a;vertical-align:top;white-space:nowrap;border-bottom:1px solid #eeecf3">${escape(k)}</td><td style="padding:8px 0;border-bottom:1px solid #eeecf3;overflow-wrap:anywhere">${k==='Email'?`<a href="mailto:${escape(v)}" style="color:#080342">${escape(v)}</a>`:escape(v)}</td></tr>`).join('')}</table><p style="margin:28px 0 8px;font-size:11px;letter-spacing:2px;color:#080342;font-weight:bold">${escape(heading.toUpperCase())}</p><p style="margin:0;font-size:16px;line-height:1.65;white-space:pre-wrap">${escape(data.message)}</p><p style="margin:32px 0 0;font-size:13px;color:#62616a">Reply to this email to answer ${escape(data.name)} directly. Also saved in Dash Forms.</p></td></tr></table></td></tr></table></body></html>`;
  return {subject,text,html};
}
