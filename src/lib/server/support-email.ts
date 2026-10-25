import 'server-only';
import {supportThankYou} from '../support-email';
import {paystack} from './paystack';
import {HttpError} from './http';
import {matchesSupportContribution, type SupportTransaction} from '../support-transaction';

export async function sendSupportThankYou(reference: string, verifiedTransaction?: SupportTransaction) {
  if (!/^support_[a-f0-9]{32}$/.test(reference)) throw new HttpError(400, 'Invalid contribution reference.');
  const transaction = verifiedTransaction ?? await paystack<SupportTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
  if (transaction.reference !== reference || !matchesSupportContribution(transaction)) throw new HttpError(409, 'Contribution could not be verified.');
  const key = process.env.RESEND_API_KEY, from = process.env.SUPPORT_EMAIL_FROM;
  if (!key || !from) throw new HttpError(503, 'Thank-you email delivery is not configured yet.');
  const message = supportThankYou(transaction.amount, reference);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `support-thanks/${reference}`},
    body: JSON.stringify({from, to: [transaction.customer.email], reply_to: 'reagan@teamraygan.com', ...message}),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    console.error('Support thank-you email rejected by provider', {status: response.status});
    throw new HttpError(503, 'Thank-you email delivery will be retried.');
  }
}
