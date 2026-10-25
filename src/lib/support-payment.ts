import {createHmac, timingSafeEqual} from 'node:crypto';
import {z} from 'zod';

export const supportInput = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/).refine(value => Number(value) >= 1 && Number(value) <= 100000),
  email: z.email().max(254),
});
export type SupportSession = {reference: string; amount: number; email: string; expires: number; origin?: string; url?: string};
export function sealSupport(session: SupportSession, key: string) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${createHmac('sha256', key).update(`support:${payload}`).digest('hex')}`;
}
export function openSupport(value: string | undefined, key: string): SupportSession | null {
  if (!value || value.length > 6000) return null;
  const [payload, signature, extra] = value.split('.');
  if (extra || !signature || !/^[a-f0-9]{64}$/.test(signature)) return null;
  const expected = createHmac('sha256', key).update(`support:${payload}`).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!/^support_[a-f0-9]{32}$/.test(session.reference) || !Number.isInteger(session.amount) || session.amount < 100 || session.amount > 10000000 || typeof session.email !== 'string' || !Number.isFinite(session.expires) || session.expires <= Date.now()) return null;
    return session;
  } catch { return null; }
}
export function checkoutUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'checkout.paystack.com' || url.username || url.password) throw new Error('Invalid checkout URL');
  return url.href;
}
