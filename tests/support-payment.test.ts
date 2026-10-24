import {test} from 'node:test';
import assert from 'node:assert/strict';
import {supportInput, sealSupport, openSupport, checkoutUrl} from '../src/lib/support-payment';
import {matchesTransaction} from '../src/lib/payment-security';

const key = 'test-only-secret';
const session = {reference: 'support_' + 'a'.repeat(32), email: 'someone@example.com', amount: 2500, expires: Date.now() + 60000};

test('contribution amounts reject fractional pesewas, negative and excessive amounts', () => {
  for (const amount of ['-1', '0', '100001', '1.001', '1e3', 'NaN']) assert.equal(supportInput.safeParse({amount, email: session.email}).success, false);
  for (const amount of ['1', '25', '75.50', '100000']) assert.equal(supportInput.safeParse({amount, email: session.email}).success, true);
});
test('receipt cannot be forged, altered, or used after expiry', () => {
  const token = sealSupport(session, key);
  assert.deepEqual(openSupport(token, key), session);
  assert.equal(openSupport(token, 'different-secret'), null);
  assert.equal(openSupport(token.replace(token[0], 'x'), key), null);
  assert.equal(openSupport(sealSupport({...session, expires: Date.now() - 1}, key), key), null);
  assert.equal(openSupport(undefined, key), null);
});
test('only the exact successful payment earns confirmation', () => {
  const transaction = {...session, currency: 'GHS', status: 'success', customer: {email: session.email}};
  assert.equal(matchesTransaction(transaction, session), true);
  for (const change of [{status: 'pending'}, {status: 'failed'}, {amount: 100}, {currency: 'USD'}, {reference: 'other'}, {customer: {email: 'other@example.com'}}]) assert.equal(matchesTransaction({...transaction, ...change}, session), false);
});
test('checkout redirects are restricted to Paystack', () => {
  assert.equal(checkoutUrl('https://checkout.paystack.com/example'), 'https://checkout.paystack.com/example');
  for (const value of ['https://checkout.paystack.com.evil.test/a', 'http://checkout.paystack.com/a', 'javascript:alert(1)', 'https://evil.test']) assert.throws(() => checkoutUrl(value));
});
