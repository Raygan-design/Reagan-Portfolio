'use client';

import {useState} from 'react';
import {Arrow} from '@/components/arrow';

export function SupportAmount() {
  const [choice, setChoice] = useState('50');
  const [custom, setCustom] = useState('');
  const amount = choice === 'other' ? custom : choice;
  const valid = /^\d+(\.\d{1,2})?$/.test(amount) && Number(amount) >= 1 && Number(amount) <= 100000;
  const formatted = valid ? new Intl.NumberFormat('en-GH', {maximumFractionDigits: 2}).format(Number(amount)) : '';
  const invalidCustom = choice === 'other' && custom !== '' && !valid;

  return <div className="support-amount">
    <fieldset className="support-amount-options">
      <legend className="eyebrow">One-time contribution · GHS</legend>
      <div className="support-amount-grid">
        {['25', '50', '100', 'other'].map(value => <label key={value} className="support-amount-option">
          <input type="radio" name="support-amount" value={value} checked={choice === value} onChange={() => setChoice(value)}/>
          <span>{value === 'other' ? 'Other' : `GHS ${value}`}</span>
        </label>)}
      </div>
    </fieldset>
    {choice === 'other' && <div className="support-custom">
      <label htmlFor="support-custom-amount">Your amount (GHS)</label>
      <input id="support-custom-amount" type="number" inputMode="decimal" min="1" max="100000" step="0.01" placeholder="Enter an amount" value={custom} onChange={event => setCustom(event.target.value)} aria-invalid={invalidCustom} aria-describedby={invalidCustom ? 'support-amount-error' : undefined}/>
      {invalidCustom && <p id="support-amount-error" role="alert">Enter GHS 1–100,000, with no more than two decimal places.</p>}
    </div>}
    <button className="button primary support-pay" disabled aria-describedby="support-payment-status">Add a little fuel{formatted && ` · GHS ${formatted}`} <Arrow/></button>
    <p id="support-payment-status" className="support-payment-status">Contributions will open soon. You can choose an amount, but no payment can be taken yet.</p>
  </div>;
}
