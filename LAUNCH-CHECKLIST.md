# RentHub launch candidate checklist

## Accounts & payments
- [ ] Supabase production project configured
- [ ] Auth redirect URLs configured for production domain
- [ ] Stripe live keys and webhook secret configured
- [ ] Test $5 listing purchase and $5 renewal

## Marketplace
- [ ] Listing creation/editing works on mobile
- [ ] Photo upload, ordering, removal, and public display tested
- [ ] Expiration and renewal tested
- [ ] Search/filter/map tested

## Messaging & trust
- [ ] Two-way conversation tested for renter and owner
- [ ] Unread/read behavior tested
- [ ] Scam/discrimination report workflow tested
- [ ] Admin account assigned through controlled database process
- [ ] Admin moderation tested

## Social connectors
- [ ] Facebook Page OAuth + publishing tested
- [ ] LinkedIn OAuth + publishing tested
- [ ] X OAuth + PKCE + publishing tested
- [ ] OAuth callback URLs match production domain exactly
- [ ] Token encryption key configured and backed up securely

## Legal & security
- [ ] Terms reviewed by counsel
- [ ] Privacy notice reviewed by counsel
- [ ] Fair-housing policy reviewed for launch jurisdictions
- [ ] Fees/refunds policy reviewed
- [ ] Security headers and RLS reviewed
- [ ] Rate limits/abuse controls reviewed
- [ ] Production build, error monitoring, backups, and rollback tested
