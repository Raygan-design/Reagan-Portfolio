import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {openSupport, sealSupport} from '@/lib/support-payment';
import {matchesTransaction} from '@/lib/payment-security';
import {paystack} from '@/lib/server/paystack';
import {sendSupportThankYou} from '@/lib/server/support-email';
import type {SupportTransaction} from '@/lib/support-transaction';
import {checkOrigin, readJson, HttpError, errorResponse} from '@/lib/server/http';

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const {reference} = await readJson(request);
    if (typeof reference !== 'string' || !/^support_[a-f0-9]{32}$/.test(reference)) throw new HttpError(400, 'Invalid payment reference.');
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) throw new HttpError(503, 'Payment verification is temporarily unavailable. Please try again shortly.');
    const jar = await cookies();
    const session = openSupport(jar.get('raygan_support')?.value, key);
    if (!session || session.reference !== reference) throw new HttpError(403, 'Please open this page in the browser where you started your contribution.');
    const transaction = await paystack<SupportTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
    if (!matchesTransaction(transaction, session)) throw new HttpError(409, 'Your payment is not confirmed yet. If you paid, wait a moment and check again.');
    // Keep the verification receipt, but never reuse a paid checkout for another contribution.
    jar.set('raygan_support', sealSupport({...session, url: undefined}, key), {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/support', maxAge: 86400,
    });
    // The webhook and browser return share one idempotency key. Either can send
    // the receipt; an email outage must never hide a confirmed contribution.
    let emailStatus = 'sent';
    try { await sendSupportThankYou(reference, transaction); }
    catch (error) {
      emailStatus = 'pending';
      console.error('Support thank-you email pending after payment verification', {status: error instanceof HttpError ? error.status : 503});
    }
    return NextResponse.json({reference, amount: session.amount, email: session.email, status: 'paid', emailStatus}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) { return errorResponse(error); }
}
