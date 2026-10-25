import {matchesTransaction, type Transaction} from './payment-security';

export type SupportTransaction = Transaction & {metadata?: {purpose?: unknown; support_amount?: unknown; support_email?: unknown}};

export function matchesSupportContribution(transaction: SupportTransaction): boolean {
  const metadata = transaction.metadata;
  if (metadata?.purpose !== 'Keep the Moving Man going' || typeof metadata.support_email !== 'string') return false;
  // Paystack serializes custom metadata amounts as strings on verification.
  const raw = metadata.support_amount;
  if (typeof raw !== 'number' && !(typeof raw === 'string' && /^\d+$/.test(raw))) return false;
  const amount = Number(raw);
  if (!Number.isSafeInteger(amount) || amount < 100 || amount > 10000000) return false;
  return /^support_[a-f0-9]{32}$/.test(transaction.reference) && matchesTransaction(transaction, {reference: transaction.reference, amount, email: metadata.support_email});
}
