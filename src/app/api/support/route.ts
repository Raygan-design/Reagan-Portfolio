import {randomUUID} from 'node:crypto';
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {supportInput, sealSupport, openSupport, checkoutUrl} from '@/lib/support-payment';
import {paystack} from '@/lib/server/paystack';
import {checkOrigin, readJson, HttpError, errorResponse} from '@/lib/server/http';

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const parsed = supportInput.safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400, 'Enter a valid email and an amount between GHS 1 and GHS 100,000.');
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) throw new HttpError(503, 'Checkout is temporarily unavailable. Please try again later.');
    const jar = await cookies();
    const amount = Math.round(Number(parsed.data.amount) * 100);
    const email = parsed.data.email.toLowerCase();
    const previous = openSupport(jar.get('raygan_support')?.value, key);
    // Reuse an unfinished checkout after a retry instead of creating another transaction.
    if (previous?.url && previous.amount === amount && previous.email === email) {
      return NextResponse.json({url: checkoutUrl(previous.url)}, {headers: {'Cache-Control': 'no-store'}});
    }
    const reference = `support_${randomUUID().replaceAll('-', '')}`;
    const base = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin;
    const checkout = await paystack<{authorization_url: string}>('/transaction/initialize', {
      email, amount, currency: 'GHS', reference,
      callback_url: `${base}/support?reference=${reference}`,
      metadata: {purpose: 'Keep the Moving Man going', cancel_action: `${base}/support?cancelled=1`},
    });
    const url = checkoutUrl(checkout.authorization_url);
    jar.set('raygan_support', sealSupport({reference, amount, email, url, expires: Date.now() + 86400000}, key), {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/support', maxAge: 86400,
    });
    return NextResponse.json({url}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) { return errorResponse(error); }
}
