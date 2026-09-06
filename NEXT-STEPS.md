# RentHub — next steps after v10

## Code is now the focus
v10 hardens the payment webhook, listing validation, cron authorization, photo storage policy, social OAuth state/PKCE handling, and production headers.

## Credentials are still entered by you — never sent in chat
When we move to real services, put the values into your hosting provider's encrypted environment-variable settings.

Required before staging:
- Supabase URL + anon key + service-role key
- Stripe secret key + webhook secret
- `NEXT_PUBLIC_SITE_URL`
- `CRON_SECRET`
- `SOCIAL_TOKEN_ENCRYPTION_KEY`

Add social credentials only when you are ready to test that provider:
- Facebook: client ID/secret + `FACEBOOK_GRAPH_VERSION`
- LinkedIn: client ID/secret + `LINKEDIN_VERSION`
- X: client ID/secret

## Before public launch
1. Create the Supabase production project and run `supabase/schema.sql`.
2. Create Stripe production/test configuration and the webhook endpoint.
3. Deploy to Vercel or another Next.js host and configure environment variables.
4. Test sign-in, listing creation, $5 payment, webhook activation, editing, photo management, expiration, renewal, messaging, moderation, and social publishing.
5. Have the legal pages reviewed for the states/markets you will serve.
