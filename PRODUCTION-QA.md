# RentHub v12 Production QA

## Required smoke tests
- [ ] Supabase schema runs cleanly.
- [ ] Email OTP login works.
- [ ] Google/Apple/Facebook auth works if enabled.
- [ ] Basic/Featured/Premium Stripe checkout each produce the correct amount.
- [ ] Stripe webhook publishes the listing for 30 days and is idempotent.
- [ ] Renewal preserves the selected listing plan.
- [ ] Map pins render and address geocoding is rate-limited/cached.
- [ ] Renter smart search applies rent/bed/type filters.
- [ ] Saved search creation works and cron creates new-match notifications.
- [ ] Tour request and owner status updates work.
- [ ] Owner confirmation updates listing freshness.
- [ ] Portfolio dashboard loads communities, active listings and billing tier.
- [ ] CSV import creates paused listings and validates rows.
- [ ] Syndication feed export returns clean JSON.
- [ ] Listing view analytics increment.
- [ ] Social publishing connectors work with production credentials.
- [ ] Admin moderation/report tools work.
- [ ] Mobile layout and accessibility checks pass.
- [ ] `npm run typecheck` and `npm run build` pass in CI/Vercel.
