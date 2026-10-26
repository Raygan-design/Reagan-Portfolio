import {serviceById,type Duration} from './catalog';

export type PaidBooking={
 reference:string;status:string;name:string;email:string;phone:string;
 service:string;duration:Duration;amount:number;currency:string;time_zone:string;
 work:string;goal:string;material:string;availability:{date:string;time:string;utc?:string}[];
 attachments?:{name:string;path:string;size:number}[];paid_at:string;
 scheduled_start?:string;scheduled_end?:string;calendar_event_id?:string;meeting_url?:string;schedule_status?:string;
};

function verifiedBooking(booking:PaidBooking){
 if(booking.status!=='paid'||!/^raygan_[a-f0-9]{32}$/.test(booking.reference)||!Number.isSafeInteger(booking.amount)||booking.amount<1||booking.currency!=='GHS'||!serviceById(booking.service))throw new Error('A verified paid consultation is required');
 return booking;
}

export function dashFormsBooking(booking:PaidBooking){
 const b=verifiedBooking(booking);
 const note=[b.work,b.goal].map(value=>value.trim()).filter(Boolean).join('\n\n');
 return {
  name:b.name,email:b.email,whatsapp:b.phone,session:serviceById(b.service)!.title,
  duration_minutes:String(b.duration),amount_paid:(b.amount/100).toFixed(2),currency:b.currency,payment_status:'Paid',
  time_zone:b.time_zone,preferred_times:b.availability.map(a=>`${a.date} ${a.time}`).join('\n')+(b.schedule_status?`\nAppointment: ${b.schedule_status}${b.meeting_url?`\nJoin: ${b.meeting_url}`:''}`:''),
  current_work:note,conversation_goals:'',reference_link:b.material||'',
  attachments:(b.attachments||[]).map(a=>a.name).join('\n'),booking_reference:b.reference,paid_at:b.paid_at,
 };
}

const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const excerpt=(value:string,limit=220)=>{
 const clean=value.replace(/\s+/g,' ').trim();
 return clean.length<=limit?clean:`${clean.slice(0,limit-1).trimEnd()}…`;
};

export function consultationConfirmation(booking:PaidBooking){
 const b=verifiedBooking(booking),title=serviceById(b.service)!.title;
 const times=b.availability.map(a=>`${a.date} · ${a.time}`).join('\n');
 const confirmed=b.schedule_status==='confirmed';
 const appointment=confirmed&&b.scheduled_start?new Intl.DateTimeFormat('en-GB',{timeZone:b.time_zone,weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(new Date(b.scheduled_start)):times;
 const appointmentDate=confirmed&&b.scheduled_start?new Intl.DateTimeFormat('en-GB',{timeZone:b.time_zone,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(b.scheduled_start)):'';
 const appointmentTime=confirmed&&b.scheduled_start?new Intl.DateTimeFormat('en-GB',{timeZone:b.time_zone,hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(new Date(b.scheduled_start)):'';
 const firstName=b.name.trim().split(/\s+/)[0]||b.name;
 const subject=confirmed?'Your consultation is booked — Team Raygan':'Your consultation request is in — Team Raygan';
 const next=confirmed?'Your appointment is confirmed. A Google Calendar invitation is on its way to this email address.':b.schedule_status==='needs_reschedule'?'Your payment has been received, but the selected time became unavailable. I’ll email you to arrange another time. Please do not pay again.':'These times are requests, not confirmed appointments. I’ll email you to agree on the final date and time, then send your calendar invitation.';
 const heading=confirmed?'Your consultation has been successfully booked!':'Your consultation request is in.';
 const timeLabel=confirmed?'Your appointment':'Your preferred times';
 const join=b.meeting_url&&/^https:\/\/meet\.google\.com\//.test(b.meeting_url)?b.meeting_url:'';
 const sharedNote=excerpt([b.work,b.goal].map(value=>value.trim()).filter(Boolean).join(' — '),320);
 const preparationText=sharedNote?`Anything you shared before the call:\n${sharedNote}`:'';
 const preparationHtml=sharedNote?`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f7f7f7" style="margin:24px 0;background:#f7f7f7;border-left:3px solid #8f73ea"><tr><td style="padding:18px 20px"><p class="email-heading" style="font-size:11px;letter-spacing:1.4px;font-weight:bold;margin:0 0 9px;color:#111111">BEFORE OUR CALL</p><p class="email-text" style="font-size:14px;line-height:1.45;color:#4b4b4b;margin:0">${escape(sharedNote)}</p></td></tr></table>`:'';
 const footer=`Reagan Marfo\nreagan@teamraygan.com`;
 const sharedText=preparationText?`\n\n${preparationText}`:'';
 const text=confirmed?`Hi ${firstName},\n\nYour consultation has been successfully booked!\n\nThank you for scheduling a session with me. I look forward to connecting with you.\n\nYour Booking Details\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nDuration: ${b.duration} minutes\nMeeting Link/Location: ${join||'See your Google Calendar invitation'}\n\nPlease make sure you’re available at the scheduled time.\n\nIf you need to reschedule or have any questions before our session, feel free to reach out.${sharedText}\n\nSee you soon!\n\nBest regards,\nReagan Marfo\n\n${footer}`:`Hi ${firstName},\n\n${heading}\n\n${next}\n\n${title}\n${b.duration}-minute session\n\n${timeLabel}:\n${appointment}${sharedText}\n\nBest regards,\nReagan Marfo\n\n${footer}`;
 const detailRows=confirmed?`<tr><td style="padding:7px 0;width:34%;font-size:13px;font-weight:bold;color:#111111">Date</td><td style="padding:7px 0;font-size:15px;color:#333333">${escape(appointmentDate)}</td></tr><tr><td style="padding:7px 0;font-size:13px;font-weight:bold;color:#111111">Time</td><td style="padding:7px 0;font-size:15px;color:#333333">${escape(appointmentTime)}</td></tr><tr><td style="padding:7px 0;font-size:13px;font-weight:bold;color:#111111">Duration</td><td style="padding:7px 0;font-size:15px;color:#333333">${b.duration} minutes</td></tr>`:`<tr><td style="padding:7px 0;font-size:13px;font-weight:bold;color:#111111">${timeLabel}</td><td style="padding:7px 0;font-size:15px;color:#333333">${escape(appointment)}</td></tr>`;
 const headingHtml=confirmed?'<span style="white-space:nowrap">Your consultation has</span><br><span style="white-space:nowrap">been successfully booked!</span>':escape(heading);
 const html=`<!doctype html><html lang="en" style="color-scheme:light only;supported-color-schemes:light only"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>${subject}</title><style>:root{color-scheme:light only!important;supported-color-schemes:light only!important}@media(max-width:480px){.email-shell{padding:20px 10px!important}.email-content{padding:28px 20px!important}.booking-title{font-size:23px!important;line-height:1.14!important;letter-spacing:-.4px!important}}@media(prefers-color-scheme:dark){.email-page{background:#f4f4f4!important}.email-card{background:#ffffff!important}.email-text{color:#333333!important}.email-heading{color:#111111!important}}</style></head><body class="email-page" bgcolor="#f4f4f4" style="margin:0;background:#f4f4f4;color:#111111;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f4" class="email-page"><tr><td align="center" class="email-shell" style="padding:30px 14px"><table role="presentation" width="580" cellpadding="0" cellspacing="0" bgcolor="#ffffff" class="email-card" style="width:100%;max-width:580px;background:#ffffff;border-top:5px solid #8f73ea"><tr><td class="email-content" style="padding:34px 30px"><p class="email-heading" style="margin:0 0 36px;color:#111111;font-size:19px;font-weight:800;letter-spacing:-.3px">RAYGAN.</p><p style="margin:0;font-size:10px;letter-spacing:1.8px;color:#4f3e91;font-weight:bold">${confirmed?'BOOKING CONFIRMED':'BOOKING UPDATE'}</p><h1 class="email-heading booking-title" style="color:#111111;font-size:32px;line-height:1.18;letter-spacing:-.7px;margin:14px 0 24px">${headingHtml}</h1><p class="email-text" style="font-size:16px;line-height:1.55;color:#333333;margin:0 0 10px">Hi ${escape(firstName)},</p><p class="email-text" style="font-size:16px;line-height:1.55;color:#333333;margin:0">${confirmed?'Thank you for scheduling a session with me. I look forward to connecting with you.':escape(next)}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f3f3f3" style="margin:26px 0;background:#f3f3f3;border-left:3px solid #8f73ea"><tr><td style="padding:22px"><p class="email-heading" style="font-size:18px;font-weight:bold;color:#111111;margin:0 0 12px">Your Booking Details</p><p class="email-heading" style="font-size:15px;font-weight:bold;color:#111111;margin:0 0 10px">${escape(title)}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${detailRows}</table>${join?`<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 0"><tr><td bgcolor="#111111" style="background:#111111"><a href="${escape(join)}" style="display:inline-block;padding:13px 19px;color:#ffffff;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:.6px">JOIN GOOGLE MEET&nbsp; ↗</a></td></tr></table>`:''}</td></tr></table>${confirmed?`<p class="email-text" style="font-size:15px;line-height:1.55;color:#333333;margin:0 0 12px">Please make sure you’re available at the scheduled time.</p><p class="email-text" style="font-size:15px;line-height:1.55;color:#333333;margin:0">If you need to reschedule or have any questions before our session, feel free to reach out.</p>`:''}${preparationHtml}<p class="email-text" style="font-size:16px;line-height:1.55;color:#333333;margin:26px 0 0">See you soon!</p><p class="email-text" style="font-size:16px;line-height:1.55;color:#333333;margin:20px 0 0">Best regards,<br><strong>Reagan Marfo</strong></p><p style="font-size:12px;line-height:1.55;color:#666666;margin:26px 0 0;padding-top:16px;border-top:1px solid #dedede"><strong style="color:#333333">Reagan Marfo</strong><br><a href="mailto:reagan@teamraygan.com" style="color:#333333">reagan@teamraygan.com</a></p></td></tr></table></td></tr></table></body></html>`;
 return {subject,text,html};
}
