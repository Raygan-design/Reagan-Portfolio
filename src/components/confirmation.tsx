'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {BookingHeader,PreferredTimes} from './booking';
import {serviceById,sessionNames,type Duration,money} from '@/lib/catalog';

type Receipt={reference:string;service:string;duration:Duration;amount:number;timeZone:string;availability:{date:string;time:string}[];paidAt:string;status:'paid';scheduleStatus?:string|null;meetingUrl?:string|null};

export function Confirmation({reference,service}:{reference:string;service:string}){
 const [receipt,setReceipt]=useState<Receipt|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const verify=useCallback(async()=>{setLoading(true);setError('');try{const res=await fetch('/api/bookings/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Payment could not be verified.');setReceipt(data);try{const raw=localStorage.getItem('raygan-booking-active-storage'),active=raw?JSON.parse(raw):null;if(active?.reference===reference&&typeof active.key==='string'){localStorage.removeItem(active.key);sessionStorage.removeItem(active.key);localStorage.removeItem('raygan-booking-active-storage')}else{localStorage.removeItem('raygan-booking-v1');sessionStorage.removeItem('raygan-booking-v1')}}catch{}}catch(err){setError(err instanceof Error?err.message:'Please try again.')}finally{setLoading(false)}},[reference]);
 useEffect(()=>{if(reference)void verify();else{setError('No payment reference was supplied. Please return to your booking.');setLoading(false)}},[reference,verify]);
 useEffect(()=>{if(receipt?.scheduleStatus!=='pending')return;const timer=setTimeout(()=>{void verify()},6000);return()=>clearTimeout(timer)},[receipt,verify]);
 const booked=receipt?.scheduleStatus==='confirmed',reschedule=receipt?.scheduleStatus==='needs_reschedule',pending=receipt?.scheduleStatus==='pending';
 return <><BookingHeader step={receipt?4:3}/><main id="main" className="booking-main receipt-page">
  {loading?<p role="status" className="loading-state">Verifying your payment…</p>:error?<div className="max-w-xl">
   <h1>Payment verification</h1>
   <p className="form-error mt-8" role="alert">{error}</p>
   <div className="card-actions mt-8">{reference&&<button className="button" onClick={verify}>CHECK AGAIN</button>}<Link className="text-button" href={`/consulting/book?service=${encodeURIComponent(service)}&payment=failed`}>RETURN TO BOOKING</Link></div>
   <p className="inline-message">Questions? <a href="mailto:reagan@teamraygan.com">Email reagan@teamraygan.com</a>.</p>
  </div>:receipt&&<>
   <div className="booking-intro"><div><p className="eyebrow">PAYMENT RECEIVED.</p><h1>Payment received.</h1></div><p>{booked?'Your consultation is booked. A confirmation email with your calendar invitation and Google Meet link has been sent.':pending?'Your payment is received. We’re preparing your calendar invitation—please don’t pay again.':reschedule?'Your payment is received, but that time became unavailable. We’ll email you to arrange another time. Please don’t pay again.':'Your session request is in. We’ll email you to confirm the final date and time before sending a calendar invitation.'}</p></div>
   <div className="payment-columns">
    <section className="payment-confirmed">
     <div className="confirmation-status" aria-hidden="true">✓</div>
     <p className="eyebrow">{booked?'PAID · APPOINTMENT CONFIRMED':'PAID · REQUEST RECEIVED'}</p>
     <h2>{serviceById(receipt.service)?.title}</h2>
     <p>{receipt.duration}-minute {sessionNames[receipt.duration]} · {money(receipt.amount/100)}</p>
     <div className="confirmation-next"><p className="eyebrow">WHAT HAPPENS NEXT</p><p>{booked?'Your confirmation email and calendar invitation include your appointment time and joining details.':pending?'We’re finishing your calendar invitation. This page will check again shortly.':reschedule?'We’ll email you to arrange a replacement time.':'We’ll email you to agree on one of your preferred times and send the final calendar invitation.'}</p></div>
    </section>
    <aside className="booking-sidebar">
     <p className="eyebrow">{booked?'YOUR APPOINTMENT':'YOUR REQUESTED TIMES'}</p>
     <PreferredTimes options={receipt.availability} timeZone={receipt.timeZone}/>
     <p>{booked?'This appointment is confirmed. Please email us if you need to make a change.':pending?'Your calendar invitation is being prepared.':reschedule?'We’ll email you to arrange another available time.':'None of these is confirmed yet. Expect an email with the final arrangement.'}</p>
     <p>Questions? Email <a href="mailto:reagan@teamraygan.com">reagan@teamraygan.com</a></p>
    </aside>
   </div>
   <div className="receipt-actions"><Link className="button" href="/">RETURN HOME</Link></div>
  </>}
 </main></>;
}
