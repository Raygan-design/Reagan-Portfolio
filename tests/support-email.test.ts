import {test} from 'node:test';
import assert from 'node:assert/strict';
import {supportThankYou} from '../src/lib/support-email';

test('thank-you email uses the verified amount in both formats', () => {
  const email = supportThankYou(300, 'support_' + 'b'.repeat(32));
  assert.match(email.html, /GHS 3\.00/);
  assert.match(email.text, /GHS 3\.00/);
  assert.match(email.text, /Thank you so much for your support/);
  assert.doesNotMatch(email.html, /<script/i);
});
test('email rejects malformed references and invalid amounts', () => {
  assert.throws(() => supportThankYou(1000, '<img src=x onerror=alert(1)>'));
  assert.throws(() => supportThankYou(-1, 'support_' + 'b'.repeat(32)));
});
