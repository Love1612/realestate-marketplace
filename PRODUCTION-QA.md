# RentHub Production QA

Run these checks against a staging project before production.

## Authentication
- Email OTP login succeeds.
- Google/Apple/Facebook OAuth callbacks return to the app.
- Logged-out users cannot access owner/admin pages.
- A normal user cannot access admin routes.

## Listings
- Owner can create a listing.
- Required fields reject invalid/empty input.
- Photos accept allowed image types and reject oversized/non-image uploads.
- Owner can edit, remove, and reorder photos.
- Payment is required before a paid listing becomes live.
- Expired listings stop appearing in public search.
- Renewal creates the next valid 30-day period.

## Payments
- Stripe test checkout completes.
- Webhook signature is verified.
- Duplicate webhook delivery does not create duplicate listing charges/state changes.
- Failed/canceled checkout leaves the listing unpublished.
- No rent percentage is charged by RentHub.

## Messaging
- Renter can start a conversation with an owner.
- Participants can reply.
- A third party cannot read another user's thread.
- Read/unread state works.
- Message length limits are enforced.

## Moderation
- Users can report listings.
- Admin can review reports.
- Admin can remove/unpublish a listing.
- Non-admin users cannot invoke admin actions.

## Social connectors
Test each provider with real developer credentials and production callback URLs:
- Facebook Page OAuth + publish
- LinkedIn OAuth + publish
- X OAuth 2.0 + publish
- Token refresh/reconnect
- Failed publication is recorded without exposing access tokens

## Security
- Supabase RLS enabled on every user-owned table.
- Service-role key exists only in server environment.
- No secret appears in browser bundles, source control, or client-side env vars.
- HTTPS enabled.
- Security headers present.
- Rate limiting/abuse controls enabled at the hosting/API layer.
- Stripe webhook endpoint validates signatures.

## Mobile/accessibility
- Test 360px, 390px, 768px and desktop widths.
- Keyboard navigation reaches every interactive control.
- Form labels/errors are accessible.
- Images have meaningful alt text.
- Focus states are visible.

## Final release
1. Apply `supabase/schema.sql` to staging.
2. Configure all staging secrets.
3. Run `npm run typecheck`.
4. Run `npm run build:check`.
5. Execute this checklist.
6. Repeat with production credentials after deployment.

## v10 hardening checks
- [ ] `CRON_SECRET` is required in production and configured in hosting.
- [ ] Stripe webhook events are stored in `stripe_events` and duplicate deliveries do not republish/extend listings.
- [ ] Listing creation validates fields server-side before Stripe Checkout is created.
- [ ] State-changing listing creation checks the production request origin.
- [ ] Listing photo storage uploads require both the signed-in owner's folder and a real listing owned by that user.
- [ ] Photo count/type/size limits are enforced in the owner UI before upload.
- [ ] X OAuth uses a separate PKCE verifier cookie from OAuth state.
- [ ] Facebook Graph API version is configurable with `FACEBOOK_GRAPH_VERSION`.
- [ ] Production HSTS is only emitted over the production build; local development remains usable.
