# GNZSPORTS backend and admin access

Admin entry: the footer's **Store manager** button or `/#admin`.
Owner email: **gulraizbutt297@gmail.com**. Contact phone: **+92 331 6841666**.

## Current activation status

Backend source and local PostgreSQL integration tests are implemented. No live migrations or owner provisioning were run in this update: the existing database connection failed TLS certificate verification, including with the Windows trust store. A service-role key is not configured. There is no verified admin password to provide.

The legacy database credential was moved out of three source scripts into ignored `.env.backend`. Since it previously existed in source, rotate it in Supabase and update the local file. Do not commit that file or put private keys into `VITE_` variables.

## Activate the live backend

1. Configure `.env.backend` using `.env.backend.example`. Supply a current database connection string and the trusted CA certificate from Supabase database settings through `SUPABASE_CA_FILE` if needed. Certificate verification stays enabled.
2. Run `npm run backend:migrate`. This applies `setup_database.sql`, `secure-store.sql`, and `media-storage.sql`, retaining existing catalog records. It replaces policies on the store tables. Run first in staging if the database serves other applications.
3. Run `npm run backend:check` to check table/function availability and anonymous order-table privacy.
4. Configure `SUPABASE_SERVICE_ROLE_KEY` and a locally chosen `GNZ_ADMIN_PASSWORD` of at least 12 characters. Run `npm run backend:owner`. It creates the owner if absent or grants admin to an existing confirmed account. Existing passwords are never changed. Remove the initial password from the environment file afterward.
5. Alternatively, run the three SQL files in the Supabase SQL editor, register and confirm the owner through the website, then run `authorize-owner.sql`. Sign out and back in.
6. Set Supabase Auth Site URL and allowed redirect URLs to your website origin and local development URL. **Forgot password?** sends a recovery link; the website handles recovery sessions and the new password form. Delivery depends on the project's Auth email configuration.
7. On localhost, use **Exit local draft** before signing into live administration. Draft access never requires a password and never publishes changes.

## Implemented integrations

- Six-category product CRUD, specifications, sizes, stock, featured products, and paginated catalog reads.
- JPEG/PNG/WebP uploads up to 5 MB in live admin mode, using the public `product-images` bucket with admin-only writes.
- Page copy, hero photo, contact details, FAQ, policy and announcement editing.
- Account registration, sign-in/out and password recovery.
- Unpaid order requests with server-calculated USD prices, supported discounts, valid sizes, aggregate stock checks, retry keys and a five-requests-per-email hourly limit.
- Fulfillment: PENDING to PROCESSING to DISPATCHED to DELIVERED; cancellation allowed before dispatch. PROCESSING deducts inventory transactionally; cancellation restores it once. Insufficient stock leaves the order pending. Direct order-table writes are revoked.
- Admin-only orders and metrics; no public order-table reads. Realtime/polling storefront refresh remains enabled. Incoming realtime events do not replace dirty admin forms.

## Limits and remaining deployment verification

Checkout submits **order requests**, not paid purchases. Shipping is confirmed manually. No card payment, automatic shipping rate, refund, or transactional order email integration is configured. Currency conversions are display estimates; accounting is USD. Email request limiting is basic throttling, not full bot protection.

Pending requests do not reserve stock. Resolve active orders before deleting their products. Historical non-pending orders created before this migration need manual inventory reconciliation; the new reservation flag does not infer past stock movements.

Local tests exercise SQL permissions, pricing, validation, retries, stock transitions, cancellation, and draft parity. Live Auth email delivery, storage uploads, websocket events, and hosted browser flows require verification after activation. No claim of full live deployment is made.

References: [Supabase password recovery](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail) and [admin provisioning](https://supabase.com/docs/reference/javascript/auth-admin-createuser).
