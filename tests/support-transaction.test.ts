import {test} from 'node:test';
import assert from 'node:assert/strict';
import {matchesSupportContribution} from '../src/lib/support-transaction';
const transaction = {reference: 'support_'+'a'.repeat(32), status:'success', currency:'GHS', amount:100, customer:{email:'supporter@example.com'}, metadata:{purpose:'Keep the Moving Man going',support_amount:'100',support_email:'supporter@example.com'}};

test('verified support receipts accept Paystack string metadata and original numeric metadata', () => {
  assert.equal(matchesSupportContribution(transaction), true);
  assert.equal(matchesSupportContribution({...transaction,metadata:{...transaction.metadata,support_amount:100}}), true);
});
test('receipt normalization never accepts an unpaid or mismatched contribution', () => {
  for (const changes of [{status:'failed'},{status:'pending'},{currency:'USD'},{amount:1000},{customer:{email:'other@example.com'}},{reference:'booking_other'}]) assert.equal(matchesSupportContribution({...transaction,...changes}),false);
  for (const support_amount of ['1e2','100.5','-100','',100.5,0,10000001,{},null]) assert.equal(matchesSupportContribution({...transaction,metadata:{...transaction.metadata,support_amount}}),false);
  assert.equal(matchesSupportContribution({...transaction,metadata:undefined}),false);
  assert.equal(matchesSupportContribution({...transaction,metadata:{...transaction.metadata,purpose:'other'}}),false);
});
