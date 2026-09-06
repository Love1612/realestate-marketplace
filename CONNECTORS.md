# RentHub connectors

RentHub keeps external credentials server-side. Never put provider secrets in `NEXT_PUBLIC_*` variables.

## Social publishing
- Facebook Pages: OAuth connection, Page token storage, direct Page feed publishing.
- LinkedIn: OAuth connection, member post publishing.
- X: OAuth 2.0 + PKCE, direct post publishing.
- WhatsApp: share-link workflow; personal WhatsApp accounts are not treated as an automated publishing API.

## Payment
Stripe Checkout is used for the $5 / 30-day listing fee and $5 renewals. Stripe webhooks activate listings after confirmed payment.

## Email
The application has an in-app notification queue. A transactional email provider can process notifications using `RESEND_API_KEY` and `EMAIL_FROM`; credentials remain server-side.

## Required production configuration
For each connector, configure the provider's app, OAuth redirect URLs, approved scopes, production domain, and secrets in the deployment environment. Test each connector with a real account before launch.

## Production connector requirements

Social publishing is an OAuth integration, not a password-based integration.
Each provider requires its own developer application, redirect URI, scopes, and
production approval where applicable. Store access/refresh tokens only on the
server, encrypted at rest. Never expose provider secrets in NEXT_PUBLIC_* vars.

Before enabling publishing for owners, verify each provider's current API
permissions and publishing rules in its developer console and complete a real
staging post using a test account/page.
