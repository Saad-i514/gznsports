# GZN Sports sandbox payments

This release adds Stripe-hosted Checkout for one-time USD purchases. It is disabled
by default. Live keys are rejected. The existing production Supabase project is
explicitly rejected by the payment backend, and no production migration is run by
the test or smoke scripts. The original order-request flow remains available while
the feature flag is off. Local draft mode continues to create browser-only orders.

## Provisioning a sandbox deployment

1. Create a **separate Supabase sandbox project** with its own catalog and orders.
   Point the preview's `VITE_SUPABASE_URL` and publishable key at that project too.
   Do not connect this payment release to production inventory.
2. On that new database only, initialize the existing schema and security from
   `scripts/setup_database.sql` and `scripts/secure-store.sql`, then apply
   `scripts/stripe-payments.sql`. The payment migration adds columns, an event
   ledger, restricted payment functions and a payment-aware fulfillment function;
   it is transactional and safe to reapply. It does not delete or reset rows.
   Do not run `backend:migrate` after it: that older script replaces the fulfillment
   function. Reapply the payment migration after any earlier security migration.
3. Configure server-only variables in the Vercel **Preview** environment:
   `STRIPE_SECRET_KEY` (GZN Sports LLC sandbox `sk_test_...`),
   `STRIPE_DATABASE_URL` (sandbox Postgres/session pooler connection),
   `STRIPE_DATABASE_CA` when the database requires its supplied CA,
   `STRIPE_SANDBOX_DATABASE_CONFIRMED=true`, and `SITE_URL` (the exact preview origin).
   Do not put any of these credentials in `VITE_*` variables.
4. Deploy the API functions and register a **sandbox** Stripe event destination at
   `https://YOUR-PREVIEW/api/stripe-webhook` for:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, and `checkout.session.expired`.
   Make that webhook path reachable by Stripe if deployment protection is enabled.
   Set `STRIPE_WEBHOOK_SECRET` to that destination's signing secret.
5. Set `STRIPE_PAYMENTS_ENABLED=true` server-side and
   `VITE_STRIPE_PAYMENTS_ENABLED=true` at build time, then redeploy the preview.
   The secret key, webhook secret, isolated database confirmation and feature flag
   are all required before checkout can create a session.
6. Enable the desired dynamic payment methods and Link in the sandbox Dashboard.
   This implementation leaves method selection to Stripe. Adaptive Pricing is
   deliberately disabled: the existing storefront's currency selector uses
   estimates, and the authoritative order ledger currently supports USD only.
   Shipping retains the existing zero-cost calculation; this sandbox does not
   calculate sales tax. Both need a business decision before any live rollout.

Use `.env.payments.local` for the reconciliation script's server-only local
configuration; it is Git-ignored. For `vercel dev`, provide those variables in
the shell environment or `.env.local`, which is also Git-ignored.
The saved `.env.local` sandbox key is loaded by the optional smoke script. It never
loads `.env.backend` or opens a production database. For a full local deployment,
use `vercel dev`; plain `vite` serves only the frontend, not the API functions.
Forward Stripe CLI events to `/api/stripe-webhook` and use the CLI's signing secret
locally. A deployed endpoint's signing secret is different from the CLI secret.

## Payment and inventory behavior

The server accepts product IDs, sizes and quantities, not client prices or payment
states. The existing database validation recalculates prices and store promo codes,
checks the reviewed total and aggregated stock, and limits orders per email. All
product rows are locked in a consistent order before reservation. Stripe line
items allocate discounts in integer cents, preserving the exact order total.
Totals below USD $0.50 are rejected without leaving an order or reservation.

One browser request key maps to one order and one Stripe idempotency key. The exact
Stripe creation parameters are persisted so retries cannot create different charges.
The browser stores a hash of the reviewed payload, not customer details, for retries
across reloads. Abandoned sessions expire in one hour. Returning from Stripe's cancel
link leaves the session open so it can be resumed. The cart remains until the server
reports PAID; changes made in another tab are preserved.

Webhooks verify the signature against raw request bytes, retrieve current session
state from Stripe, and verify its order reference, session ID, mode, currency and
amount before making a transactional update. The event ledger deduplicates delivery.
Delayed payments remain PROCESSING until success or failure. Expiry and failure
release stock once. A browser success URL never marks an order paid. The status
endpoint returns only a short reference and payment state, without customer data.

Admin confirmation of a paid Stripe order does not decrement stock again. Unpaid
Stripe orders cannot be dispatched. Admin cancellation of Stripe orders is blocked:
refunds and associated inventory reconciliation must be handled deliberately; this
release does not automate refunds, disputes, tax or live fulfillment.

## Recovery and operations

Run `npm run payments:reconcile` periodically with the sandbox server environment
(for example every 15 minutes using your deployment's scheduler). It retrieves
Stripe state for up to 100 reservations older than two hours. If creation succeeded
but the database missed the session ID, it exhaustively searches the creation window
and reattaches the session. Only after a successful exhaustive search finds no session
does it release an orphan reservation. Network errors retain stock for a safe retry.
Orders needing manual inventory reconciliation stay visible and cause a failure.
Monitor non-2xx webhook deliveries and reconciliation failures. Do not manually
release inventory merely because a network request timed out.

Use Vercel rate limiting on `POST /api/checkout` before exposing the sandbox publicly;
per-email limits do not by themselves stop distributed inventory reservation abuse.
Database credentials must be server-only; a dedicated trusted database role needs
access to orders/products/events and the restricted payment functions. Anonymous
and authenticated Supabase clients cannot execute them or read the event ledger.

## Verification

- `npm test`: isolated PostgreSQL checks for pricing, reservations, permissions,
  payment transitions, replay, stock restoration and raw-body signature rejection.
- `npm run build`: storefront build, preserving product-image sizing and quantities.
- `npm run payments:smoke`: optional network test. Uses the saved test key and an
  in-memory database, verifies the planner-selected account, creates a real sandbox
  Checkout Session, checks the discounted total and retry reuse, expires it, and
  verifies stock restoration. It submits **no payment** and does not register a
  webhook or deploy anything. Its event dispatch is local reconciliation, not proof
  of externally delivered signed webhooks.
- On the configured preview, complete hosted Checkout with Stripe's test card
  `4242 4242 4242 4242`, a future expiry and any three-digit CVC. Verify the real
  webhook marks PAID, the return view confirms payment and admin confirmation
  doesn't reserve stock again. Also test decline, 3DS, cancel/resume, expiration,
  delayed payment methods and webhook redelivery before enabling wider access.

Planner: GZN Sports LLC sandbox, accepted Stripe-hosted web Checkout.
References: [Checkout integration](https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=stripe-hosted),
[fulfillment and delayed payments](https://docs.stripe.com/checkout/fulfillment),
[signature verification](https://docs.stripe.com/webhooks), and
[Vercel Node web handlers](https://vercel.com/docs/functions/runtimes/node-js).
