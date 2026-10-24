'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {useSupportPayment} from './support-payment-provider';
import {Arrow} from '@/components/arrow';

export function SupportAmount() {
  const {confirm} = useSupportPayment();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [paid, setPaid] = useState(false);
  async function verify(ref: string) {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/support/verify', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({reference: ref})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not check your payment. Please try again.');
      setPaid(true); confirm(result.reference);
      window.history.replaceState(null, '', '/support');
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not check your payment. Please try again.'); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const ref = query.get('reference');
    if (ref) { setReference(ref); void verify(ref); }
    else if (query.get('cancelled')) setError('Checkout closed. You can try again whenever you’re ready.');
    // Verify only on arrival from checkout; changing form values must not repeat it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/support', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({amount, email})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not open checkout. Please try again.');
      window.location.assign(result.url);
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not open checkout. Please try again.'); setBusy(false); }
  }
  const [choice, setChoice] = useState('50');
  const [custom, setCustom] = useState('');
  const amount = choice === 'other' ? custom : choice;
  const valid = /^\d+(\.\d{1,2})?$/.test(amount) && Number(amount) >= 1 && Number(amount) <= 100000;
  const formatted = valid ? new Intl.NumberFormat('en-GH', {maximumFractionDigits: 2}).format(Number(amount)) : '';
  const invalidCustom = choice === 'other' && custom !== '' && !valid;

  if (paid) return <div className="support-amount" role="status"><h3>A little further, thanks to you.</h3><p className="support-payment-status">Thank you for putting a little fuel in the journey. Your contribution is confirmed.</p></div>;
  if (reference) return <div className="support-amount" aria-live="polite">{busy ? <p>Confirming your contribution…</p> : <><p role="alert">{error}</p><button className="button outline" onClick={() => void verify(reference)}>Check payment again</button><button className="text-button" onClick={() => {setReference(''); setError(''); window.history.replaceState(null, '', '/support');}}>Return to contribution</button></>}</div>;
  return <form className="support-amount" onSubmit={checkout} aria-busy={busy}>
    <fieldset className="support-amount-options" disabled={busy}>
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
    <div className="support-custom">
      <label htmlFor="support-email">Email address</label>
      <input id="support-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={busy}/>
    </div>
    <button className="button primary support-pay" disabled={!valid || busy}>{busy ? 'Opening Paystack…' : <>Add a little fuel{formatted && ` · GHS ${formatted}`} <Arrow/></>}</button>
    {error && <p className="support-payment-status" role="alert">{error}</p>}
  </form>;
}
