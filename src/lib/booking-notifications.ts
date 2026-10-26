import {serviceById, type Duration} from './catalog';
export type PaidBooking = {
 reference:string; status:string; name:string; email:string; phone:string;
 service:string; duration:Duration; amount:number; currency:string; time_zone:string;
 work:string; goal:string; material:string; availability:{date:string;time:string;utc?:string}[];
 attachments?:{name:string;path:string;size:number}[]; paid_at:string;
 scheduled_start?:string;scheduled_end?:string;calendar_event_id?:string;meeting_url?:string;schedule_status?:string;
};
function verifiedBooking(booking:PaidBooking){
 if(booking.status!=='paid'||!/^raygan_[a-f0-9]{32}$/.test(booking.reference)||!Number.isSafeInteger(booking.amount)||booking.amount<1||booking.currency!=='GHS'||!serviceById(booking.service))throw new Error('A verified paid consultation is required');
 return booking;
}
export function dashFormsBooking(booking:PaidBooking){
 const b=verifiedBooking(booking);
 return {
  name:b.name,email:b.email,whatsapp:b.phone,session:serviceById(b.service)!.title,
  duration_minutes:String(b.duration),amount_paid:(b.amount/100).toFixed(2),currency:b.currency,payment_status:'Paid',
  time_zone:b.time_zone,preferred_times:b.availability.map(a=>`${a.date} ${a.time}`).join('\n')+(b.schedule_status?`\nAppointment: ${b.schedule_status}${b.meeting_url?`\nJoin: ${b.meeting_url}`:''}`:''),
  current_work:b.work,conversation_goals:b.goal,reference_link:b.material||'',
  attachments:(b.attachments||[]).map(a=>a.name).join('\n'),booking_reference:b.reference,paid_at:b.paid_at,
 };
}
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function consultationConfirmation(booking:PaidBooking){
 const b=verifiedBooking(booking), title=serviceById(b.service)!.title;
 const amount=new Intl.NumberFormat('en-GH',{minimumFractionDigits:2,maximumFractionDigits:2}).format(b.amount/100);
 const times=b.availability.map(a=>`${a.date} · ${a.time}`).join('\n');
 const confirmed=b.schedule_status==='confirmed';
 const appointment=confirmed&&b.scheduled_start?new Intl.DateTimeFormat('en-GB',{timeZone:b.time_zone,weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(new Date(b.scheduled_start)):times;
 const subject=confirmed?'Your consultation is booked — Team Raygan':'Your consultation request is in — Team Raygan';
 const next=confirmed?'Your appointment is confirmed. A Google Calendar invitation is on its way to this email address.':b.schedule_status==='needs_reschedule'?'Your payment has been received, but the selected time became unavailable. I’ll contact you on WhatsApp to arrange another time. Please do not pay again.':'These times are requests, not confirmed appointments. I’ll contact you on WhatsApp to agree on the final date and time, then send your calendar invitation.';
 const heading=confirmed?'Your consultation is booked.':'Your consultation request is in.';
 const timeLabel=confirmed?'Your appointment':'Your preferred times';
 const join=b.meeting_url&&/^https:\/\/meet\.google\.com\//.test(b.meeting_url)?b.meeting_url:'';
 const text=`Hi ${b.name},\n\nThank you for booking a conversation with me. Your payment of GHS ${amount} has been received.\n\n${title}\n${b.duration}-minute session\n\n${timeLabel}:\n${appointment}\n\n${next}${join?`\n\nJoin the Google Meet: ${join}`:''}\n\nStill moving. Still creating.\nReagan\n\nTeam Raygan\nreagan@teamraygan.com`;
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head><body style="margin:0;background:#f6f5f9;color:#131313;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="580" cellpadding="0" cellspacing="0" style="width:100%;max-width:580px;background:#fff;border-top:6px solid #ad93ff"><tr><td style="padding:38px 30px"><p style="margin:0 0 42px;color:#000047;font-size:20px;font-weight:800;letter-spacing:-.4px">RAYGAN.</p><p style="margin:0;font-size:11px;letter-spacing:2px;color:#000047;font-weight:bold">${confirmed?'YOUR SESSION IS CONFIRMED':'A CONVERSATION WORTH HAVING'}</p><h1 style="font-size:36px;line-height:1.12;letter-spacing:-1px;margin:18px 0 28px">${escape(heading)}</h1><p style="font-size:17px;line-height:1.7;margin:0 0 12px">Hi ${escape(b.name)},</p><p style="font-size:17px;line-height:1.7;color:#55545d;margin:0">Thank you for booking a conversation with me. Your payment has been received.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;background:#f2efff;border-left:4px solid #ad93ff"><tr><td style="padding:24px"><p style="font-size:20px;font-weight:bold;color:#000047;margin:0 0 8px">${escape(title)}</p><p style="font-size:15px;line-height:1.7;margin:0;color:#55545d">${b.duration}-minute session · GHS ${amount}</p><p style="font-size:11px;letter-spacing:1.4px;font-weight:bold;margin:24px 0 8px;color:#000047">${timeLabel.toUpperCase()}</p><p style="font-size:16px;line-height:1.7;margin:0;font-weight:600">${escape(appointment)}</p>${confirmed?`<p style="font-size:13px;line-height:1.6;margin:6px 0 0;color:#706979">Shown in ${escape(b.time_zone)}</p>`:''}</td></tr></table><p style="font-size:16px;line-height:1.7;color:#55545d;margin:0">${escape(next)}</p>${join?`<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px"><tr><td style="background:#000047"><a href="${escape(join)}" style="display:inline-block;padding:16px 24px;color:#fff;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:.8px">JOIN GOOGLE MEET&nbsp; ↗</a></td></tr></table><p style="font-size:12px;line-height:1.6;color:#706979;margin:0">You can also join from the Google Calendar invitation sent to this email.</p>`:''}<p style="font-size:17px;line-height:1.7;margin-top:36px">Still moving. Still creating.<br><strong>Reagan</strong></p><p style="font-size:13px;line-height:1.7;color:#706979;margin:34px 0 0;padding-top:22px;border-top:1px solid #e6e4ea">Team Raygan<br><a href="mailto:reagan@teamraygan.com" style="color:#000047">reagan@teamraygan.com</a></p></td></tr></table></td></tr></table></body></html>`;
 return {subject,text,html};
}
