# RentHub Launch Candidate v9

This release is a production-QA/hardening candidate. It is not a substitute for
staging validation with real Supabase, Stripe, OAuth provider, email, and hosting
credentials.

Release priorities:
- run typecheck/build
- execute PRODUCTION-QA.md
- verify RLS and server authorization
- verify real OAuth publishing
- configure production secrets
- deploy staging, then production
