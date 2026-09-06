# RentHub — User-Friendly Rental Marketplace MVP

RentHub is a simple rental marketplace where property owners can publish listings for **$5 for 30 days**. The platform does **not** take a percentage of rent.

## UX priorities built into this version

- Mobile-friendly layout
- Plain-language buttons and instructions
- Passwordless email login
- Photo previews before payment
- Up to 12 photos per listing
- First photo is the cover
- Simple left/right photo reordering
- Remove photos
- Owner dashboard with clear status
- Edit listings without paying again during the active 30-day period
- Renew expired listings for $5
- Public renters only see active, non-expired listings
- Stripe Checkout handles the $5 listing fee
- Stripe webhook is the source of truth for publishing/renewing

## Setup

1. Create a Supabase project.
2. Open `supabase/schema.sql` in the Supabase SQL editor and run it.
3. Create a Stripe account and set up a webhook pointing to:
   `/api/stripe-webhook`
   Subscribe to `checkout.session.completed`.
4. Copy `.env.example` to `.env.local` and fill in the values.
5. Install packages:
   `npm install`
6. Run:
   `npm run dev`

## Stripe

The MVP charges exactly $5 USD per publish/renewal. Rent payments are not processed by this app.

## Production hardening still recommended

Before public launch, add:
- server-side validation/schema validation
- rate limiting and abuse prevention
- image moderation and stronger image validation
- fair-housing/content moderation rules
- terms, privacy policy, refund policy, and prohibited-listing policy
- email notifications and inquiry messaging
- CAPTCHA/bot protection
- admin moderation tools
- automated tests
- error monitoring
- stronger storage path authorization
- legal review of local/state rental rules

## Social sharing
Listing detail pages include share actions for Facebook, X, WhatsApp, LinkedIn, email, native device sharing, and copy-link. Listing pages also generate Open Graph and Twitter metadata so shared links have useful previews.

## Social connectors
RentHub now supports connector-based social sign-in through Supabase Auth: **Google, Apple, and Facebook**, plus email magic-link sign-in. Configure the three providers in Supabase Authentication → Sign In / Providers and set each provider callback to the Supabase callback URL shown in the provider settings.

The app callback route is `/auth/callback`, which exchanges the OAuth code for a Supabase session and returns the user to the requested page. Social sharing remains available for Facebook, X, WhatsApp, LinkedIn, email, native device sharing, and copy-link.

For production, keep provider secrets in Supabase/server environment settings—never in browser code or source control.


## Social publishing connectors
Owners can connect Facebook Pages, LinkedIn, and X using OAuth and publish their live RentHub listings directly. Credentials and access tokens stay server-side and are encrypted at rest. See `CONNECTORS.md`.


## Production QA
See `PRODUCTION-QA.md` and `RELEASE.md` before deploying publicly.
