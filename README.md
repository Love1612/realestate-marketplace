# RentHub v12

RentHub is a mobile-first rental marketplace for renters, independent owners, and multi-property organizations.

## v12 launch features
- Basic $5 / 30 days, Featured $8 / 30 days, Premium $12 / 30 days.
- Portfolio tiers: 10/$35, 25/$70, 50/$140, 100/$225, 250/$450 monthly; 500+ custom.
- Portfolio/community/unit architecture for apartment communities and multifamily operators.
- Search + map, smart natural-language search, filters, saved searches and alert matching.
- Total monthly-cost transparency fields, deposit, pets, parking and amenities-ready listing model.
- Owner-confirmed freshness and verification badges.
- Tour requests with in-person or video-tour modes.
- Owner market pricing intelligence and listing analytics.
- Bulk CSV import and syndication-ready JSON feed export.
- Social publishing connectors, messaging, favorites, reports, admin tools, Stripe checkout and Supabase auth.
- SEO metadata, legal/fair-housing pages, security headers and mobile-friendly UI.

## Stack
Next.js 15, React 19, TypeScript, Supabase/Postgres/Auth/Storage, Stripe, Vercel, Leaflet/OpenStreetMap.

Supabase's current Next.js guidance uses cookie-based SSR auth and publishable keys in environment variables; review RLS before production. citeturn0search1turn0search2

## Setup
1. Upload the project to GitHub.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. Add the variables from `.env.example` to Vercel and Supabase where appropriate.
4. In Stripe, configure the webhook to `/api/stripe-webhook` and add the webhook secret.
5. Configure OAuth/social provider credentials for the connectors you want enabled.
6. Deploy on Vercel.
7. Run `npm install`, `npm run typecheck`, and `npm run build` before launch.

Never commit secrets. Supabase recommends environment variables for deployed credentials. citeturn0search1

## CSV import columns
`title,description,property_type,address,city,state,zip,monthly_rent,bedrooms,bathrooms,available_on`

CSV imports create paused listings so the owner can review them before publication/payment.

## Pricing math
Portfolio pricing is based on active advertised listings, not every unit owned. This makes the economics work for apartment communities with many occupied units and a smaller number of vacancies.

## Production review
The v12 package is a consolidated product build. Before public launch, verify environment variables, Supabase RLS, Stripe webhook delivery, social OAuth callbacks, Vercel cron authorization, map/geocoding rate limits, email delivery, and a full production build/typecheck in the deployment environment.
