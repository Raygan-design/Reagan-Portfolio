import 'server-only';
import {supportThankYou} from '../support-email';
import {paystack} from './paystack';
import {HttpError} from './http';
import {matchesTransaction, type Transaction} from '../payment-security';

type SupportTransaction = Transaction & {metadata?: {purpose?: string; support_amount?: number; support_email?: string}};
export async function sendSupportThankYou(reference: string) {
  if (!/^support_[a-f0-9]{32}$/.test(reference)) throw new HttpError(400, 'Invalid contribution reference.');
  const transaction = await paystack<SupportTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
  const metadata = transaction.metadata;
  if (metadata?.purpose !== 'Keep the Moving Man going' || typeof metadata.support_amount !== 'number' || typeof metadata.support_email !== 'string' || !matchesTransaction(transaction, {reference, amount: metadata.support_amount, email: metadata.support_email})) throw new HttpError(409, 'Contribution could not be verified.');
  const key = process.env.RESEND_API_KEY, from = process.env.SUPPORT_EMAIL_FROM;
  if (!key || !from) throw new HttpError(503, 'Thank-you email delivery is not configured yet.');
  const message = supportThankYou(transaction.amount, reference);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `support-thanks/${reference}`},
    body: JSON.stringify({from, to: [transaction.customer.email], reply_to: 'reagan@teamraygan.com', ...message}),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new HttpError(503, 'Thank-you email delivery will be retried.');
}
