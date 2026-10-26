'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {BookingHeader,PreferredTimes} from './booking';
import {money,serviceById,sessionNames,type Duration} from '@/lib/catalog';
type Receipt={service:string;duration:Duration;amount:number;timeZone:string;availability:{date:string;time:string}[];email:string};
export function PreviewConfirmation(){
 const [receipt,setReceipt]=useState<Receipt|null>(null),[ready,setReady]=useState(false);
 useEffect(()=>{try{const raw=sessionStorage.getItem('raygan-booking-preview-receipt');if(raw)setReceipt(JSON.parse(raw))}finally{setReady(true)}},[]);
 return <><BookingHeader step={4}/><main id="main" className="booking-main receipt-page">{!ready?<p className="loading-state">Preparing your test confirmation…</p>:!receipt?<div className="max-w-xl"><h1>Test confirmation unavailable</h1><p className="mt-8">Open your private test booking link and complete the preview again.</p></div>:<><div className="booking-intro"><div><p className="eyebrow">TEST EMAIL SENT.</p><h1>Preview complete.</h1></div><p>The redesigned confirmation email was sent to {receipt.email}. No payment was taken and no calendar time was reserved.</p></div><div className="payment-columns"><section className="payment-confirmed"><div className="confirmation-status" aria-hidden="true">✓</div><p className="eyebrow">PRIVATE TEST · NO PAYMENT</p><h2>{serviceById(receipt.service)?.title}</h2><p>{receipt.duration}-minute {sessionNames[receipt.duration]} · {money(receipt.amount/100)}</p><div className="confirmation-next"><p className="eyebrow">WHAT TO CHECK</p><p>Review the email’s typography, booking details, meeting button and dark-mode appearance.</p></div></section><aside className="booking-sidebar"><p className="eyebrow">PREVIEWED APPOINTMENT</p><PreferredTimes options={receipt.availability} timeZone={receipt.timeZone}/><p>This was a visual and email test only.</p></aside></div><div className="receipt-actions"><Link className="button" href="/consulting">RETURN TO CONSULTING</Link></div></>}</main></>;
}
