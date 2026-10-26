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
 const subject=confirmed?'Your consultation is booked — Team Raygan':'Your consultation request is in — Team Raygan';
 const next=confirmed?'Your appointment is confirmed. A Google Calendar invitation is on its way to this email address.':b.schedule_status==='needs_reschedule'?'Your payment has been received, but the selected time became unavailable. I’ll contact you on WhatsApp to arrange another time. Please do not pay again.':'These times are requests, not confirmed appointments. I’ll contact you on WhatsApp to agree on the final date and time, then send your calendar invitation.';
 const heading=confirmed?'Your consultation is booked.':'Your consultation request is in.';
 const timeLabel=confirmed?'Your appointment':'Your preferred times';
 const join=b.meeting_url&&/^https:\/\/meet\.google\.com\//.test(b.meeting_url)?b.meeting_url:'';
 const text=`Hi ${b.name},\n\nThank you for booking a conversation with me. Your payment of GHS ${amount} has been received.\n\n${title}\n${b.duration}-minute session\n\n${timeLabel} (${b.time_zone}):\n${times}\n\n${next}${join?`\nJoin the conversation: ${join}`:''}\n\nStill moving. Still creating.\nReagan\n\nTeam Raygan\nreagan@teamraygan.com`;
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head><body style="margin:0;background:#f6f5f9;color:#131313;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#fff;border-top:6px solid #ad93ff"><tr><td style="padding:36px 28px"><p style="margin:0 0 36px;color:#000047;font-size:20px;font-weight:800">RAYGAN.</p><p style="font-size:11px;letter-spacing:2px;color:#000047;font-weight:bold">A CONVERSATION WORTH HAVING</p><h1 style="font-size:36px;line-height:1.12;letter-spacing:-1px;margin:20px 0 28px">${escape(heading)}</h1><p style="font-size:17px;line-height:1.7">Hi ${escape(b.name)},</p><p style="font-size:17px;line-height:1.7;color:#55545d">Thank you for booking a conversation with me. Your payment has been received.</p><div style="padding:24px;background:#f2efff;margin:28px 0"><p style="font-size:20px;font-weight:bold;color:#000047;margin:0 0 8px">${escape(title)}</p><p style="font-size:16px;line-height:1.7;margin:0">${b.duration}-minute session · GHS ${amount}</p><p style="font-size:11px;letter-spacing:1px;font-weight:bold;margin:24px 0 8px;color:#000047">${timeLabel.toUpperCase()}</p><p style="font-size:15px;line-height:1.8;margin:0">${b.availability.map(a=>`${escape(a.date)} · ${escape(a.time)}`).join('<br>')}<br><span style="color:#706979">${escape(b.time_zone)}</span></p></div><p style="font-size:16px;line-height:1.7;color:#55545d">${escape(next)}${join?`<br><a href="${escape(join)}" style="color:#000047">Join the conversation</a>`:''}</p><p style="font-size:17px;line-height:1.7;margin-top:30px">Still moving. Still creating.<br><strong>Reagan</strong></p><p style="font-size:13px;line-height:1.7;color:#706979;margin:32px 0 0">Team Raygan<br><a href="mailto:reagan@teamraygan.com" style="color:#000047">reagan@teamraygan.com</a></p></td></tr></table></td></tr></table></body></html>`;
 return {subject,text,html};
}
