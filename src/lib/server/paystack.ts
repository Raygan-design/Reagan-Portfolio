import 'server-only';
import { createHash } from 'node:crypto';
import { database, ConfigurationError } from './db';
import { HttpError } from './http';
import { matchesTransaction, type Transaction } from '../payment-security';
export function paystackKey(){const key=process.env.PAYSTACK_SECRET_KEY;if(!key)throw new ConfigurationError('Online payments are not connected yet. Please contact reagan@teamraygan.com to book.');return key}
export async function paystack<T>(path:string,body?:unknown):Promise<T>{const response=await fetch(`https://api.paystack.co${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${paystackKey()}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(15000)});const result=await response.json();if(!response.ok||!result.status)throw new HttpError(502,'The payment provider could not complete this request. Please try again.');return result.data as T}
export function hashToken(token:string){return createHash('sha256').update(token).digest('hex')}
export async function verifyOrder(reference:string){if(!/^raygan_[a-f0-9]{32}$/.test(reference))throw new HttpError(400,'Invalid payment reference.');const db=database();const {data:order,error}=await db.from('bookings').select('*').eq('reference',reference).single();if(error||!order)throw new HttpError(404,'Booking not found.');
  const transaction=await paystack<Transaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
  if(!matchesTransaction(transaction,{reference,amount:order.amount,email:order.email}))throw new HttpError(transaction.status==='success'?409:402,transaction.status==='success'?'Payment details do not match this booking. Please contact us.':'Payment has not been confirmed yet. If you paid, wait a moment and try again.');
  const {error:updateError}=await db.from('bookings').update({status:'paid',paid_at:transaction.paid_at||new Date().toISOString()}).eq('reference',reference).neq('status','paid');if(updateError)throw new HttpError(503,'Your payment is being recorded. Please try again shortly.');return {...order,status:'paid',paid_at:transaction.paid_at};
}
