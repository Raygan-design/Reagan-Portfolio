# Raygan support emails — DNS setup

Please add these records to the existing DNS zone for **teamraygan.com** to authorize Resend to send payment thank-you emails. Keep existing website and mailbox records unchanged. If any hostname already exists, check the conflict before replacing it.

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| TXT | resend._domainkey | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdcpoXFR7Dg4s8MgtM/TNkaSa4is5TUXlADeiYSPB8gZmw6yHisrmBl3RsUcJORxc14KaU17OEZKZ09rLuOMh53NXYvH+4q+RNzn4sUiH2CZ2CcRE8K7z/LDEY1Ou1z1kXK2ATdyhdgCoPgyxh5tYp/JmlShYsgWVXic6nkonGVQIDAQAB | Auto |
| CNAME | rsend | rsend-euw1.forge.rmta.net | Auto |
| CNAME | send | send.forge.rmta.net | Auto |

These are the exact records supplied by Resend on October 24, 2026. Receiving email is disabled in Resend. Do not change the domain's root MX records or replace an existing DMARC policy.

After adding them, return to Resend → Domains → teamraygan.com and verify the records.

## Remaining application setup

- Verify the domain in Resend.
- Create a sending-only Resend API key scoped to teamraygan.com; save it securely in Vercel as `RESEND_API_KEY`.
- Set `SUPPORT_EMAIL_FROM` to `Reagan <reagan@teamraygan.com>` in Vercel.
- In Paystack Live Settings → API Keys & Webhooks, set the webhook URL to `https://reagan-portfolio-phi.vercel.app/api/paystack/webhook`.
- Redeploy and test email delivery using an authorized test recipient before calling email delivery active.

The webhook verifies successful Paystack transactions and checks their support metadata before sending. Resend's idempotency key suppresses duplicate sends within its 24-hour retention window. For permanent deduplication across manually replayed events older than 24 hours, add a durable delivery ledger before using historical webhook replays. Paystack records remain the payment ledger; email delivery failure does not change payment status.
