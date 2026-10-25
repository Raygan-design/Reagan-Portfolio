# Raygan portfolio

Responsive implementation of the Paper portfolio: Home, About, Speaking, Consulting, Contact, session details and a three-step booking checkout with a verified confirmation page.

Next.js App Router, TypeScript, Tailwind CSS, Supabase and Paystack; ready to import into Vercel. Original Bricolage Grotesque and Oooh Baby fonts, colors, copy and photos are retained. Mobile uses stacked layouts, a full-screen navigation menu, readable typography, native accessible dialogs, labelled forms and keyboard-operable galleries. TikTok and X were added from the supplied public links. Operational messages clarify unavailable integrations and requested appointment times.

## Run locally

Use Node.js 24.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://127.0.0.1:3000. For local forms, set `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000` in `.env.local` (the origin must match the address you visit).

```sh
npm test
npm run typecheck
npm run build
npm start
```

Webpack is explicitly selected for compatibility with environments that restrict Turbopack worker processes. Fonts are served locally. The 38 source photos are resized WebP assets totaling approximately 6 MB.

## Set up your accounts and launch

1. **Supabase:** create a project in your own account at https://supabase.com/dashboard. In SQL Editor, run `supabase/migrations/001_initial.sql`, then `supabase/migrations/002_booking_attachments.sql`. This creates inquiries, bookings and a rate-limiter, with row-level security enabled and no public table access. Copy the project URL and a server **secret key** from Settings → API Keys directly into Vercel environment variables; do not send keys through chat or commit them. [Supabase key guide](https://supabase.com/docs/guides/getting-started/api-keys).
2. **Paystack:** create or sign into your Ghana business account, complete its activation requirements, and begin in test mode. Copy its test secret key directly into Vercel as `PAYSTACK_SECRET_KEY`. Both 30- and 60-minute sessions temporarily charge **GHS 1** for the live checkout test, with amounts calculated on the server. After testing, restore `prices` in `src/lib/catalog.ts` to `{30: 500, 60: 1000}`.
3. **Vercel:** sign in with GitHub, choose Add New → Project and import `Raygan-design/Reagan-Portfolio`. Keep the Next.js preset and repository root. Set the production branch to the branch containing this implementation. Add the variables below and deploy. Set the final HTTPS domain as `NEXT_PUBLIC_SITE_URL`, then redeploy. [Vercel GitHub guide](https://vercel.com/docs/git/vercel-for-github).
4. **Webhook:** in the Paystack dashboard, set your webhook URL to `https://YOUR-DOMAIN/api/paystack/webhook`. Use the same test/live mode as the configured key. The endpoint verifies Paystack's signature and independently verifies the transaction before marking a booking paid. [Paystack webhook guide](https://paystack.com/docs/payments/webhooks/).
5. **Test before live payments:** submit a contact inquiry and inspect the `inquiries` table; complete a test booking for each duration; confirm amount, currency and paid status in both dashboards; try cancelling checkout and refreshing confirmation. Confirm webhooks arrive successfully. Then replace the test secret with your live secret in Vercel and redeploy. Never use live keys for preview deployments.

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Final HTTPS domain, without a trailing slash |
| `SUPABASE_URL` | Your project URL |
| `SUPABASE_SECRET_KEY` | Server-only Supabase secret key |
| `PAYSTACK_SECRET_KEY` | Paystack test secret initially; live secret after verification |

The old `SUPABASE_SERVICE_ROLE_KEY` name remains supported for existing projects. Neither Supabase key should use a `NEXT_PUBLIC_` prefix. This site does not need a public Supabase key. Preview deployments need their own matching public URL and test credentials if you want to test forms there.

## Content and remaining assets

Your podcast website, YouTube, Instagram, TikTok, X and Team Raygan links are connected. Optional environment variables can override the supplied links. Greyend Studio and Raygan Studio are connected. LinkedIn remains unavailable until its URL is provided. Original About-page image placeholders remain as in Paper. The film and three reel players require direct HTTPS video files; a YouTube channel URL is not a playable video file. See `.env.example` for each field. No invented video or destination is used.

## Booking and inquiry operations

- Contact submissions are saved to Supabase. The normal Contact form is separate from `/speaking/enquiry`. Speaking and hosting enquiries include company, phone, event date, format, location, role, audience, conditional budget and the full brief, stored together in the inquiry message without an additional migration. There is no automatic email notification or admin dashboard yet; review inquiries in Supabase's Table Editor.
- Availability is three **requests**, not reserved calendar slots. After verified payment, review the booking and contact the customer on WhatsApp yourself to agree a time and send a calendar invitation. No WhatsApp or calendar messages are sent automatically.
- Save & Exit keeps the draft for up to 24 hours in the same browser tab. It is not an emailed recovery link or cross-device account.
- Reference material supports an optional HTTPS link and up to three files (3 MB combined): PDF, DOCX, PPTX, TXT, PNG or JPG. Files upload with the booking before checkout and are kept in the private `booking-materials` bucket. The `attachments` column records their original names and storage paths. Review/download them through the authenticated Supabase dashboard; there are no public file URLs. File selection stays in memory and must be repeated after Save & Exit or a refresh.
- Payment confirmation requires the original browser cookie as well as verified transaction details. The downloadable receipt is a plain-text payment record, not a tax invoice.
- Payments and forms fail clearly when credentials are absent. The site must not be advertised as accepting bookings until the account setup and test checkout have passed.
- Rate limits use a trusted proxy IP header as supplied by Vercel. Other hosts must overwrite incoming forwarded-IP headers. Store only the information needed for follow-up, restrict dashboard access and establish a retention policy before launch.

## Validation completed

Production build and TypeScript checks; fifteen automated tests covering approved prices, booking validation, time zones, signature verification and payment mismatch rejection. Browser checks at 1440, 390 and 320 pixels covered all main pages without horizontal overflow, mobile navigation, session dialog and booking details through the GHS 1000 summary. Live Supabase writes, Paystack checkout/webhook delivery and Vercel hosting require your accounts and have not been verified.
