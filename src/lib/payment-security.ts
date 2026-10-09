import { createHmac, timingSafeEqual } from 'node:crypto';
export function validSignature(raw:string,signature:string|null,key:string){if(!signature||!/^[a-f0-9]{128}$/i.test(signature))return false;const expected=createHmac('sha512',key).update(raw).digest();return timingSafeEqual(expected,Buffer.from(signature,'hex'))}
export type Transaction={status:string;reference:string;amount:number;currency:string;customer:{email:string};paid_at?:string};
export function matchesTransaction(transaction:Transaction,order:{reference:string;amount:number;email:string}){return transaction.status==='success'&&transaction.reference===order.reference&&transaction.amount===order.amount&&transaction.currency==='GHS'&&transaction.customer?.email?.toLowerCase()===order.email.toLowerCase()}
