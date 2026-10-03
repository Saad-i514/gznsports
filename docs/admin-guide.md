# Store management

Open the footer's **Store manager** button or visit `/#admin`.

## Local draft editor

On localhost, choose **Open local draft editor**. Products, content, and test orders persist in this browser's local storage. The yellow banner identifies this mode. Changes never publish to Supabase. **Exit local draft** restores the live catalog; your local draft remains available for later work. The verification workspace contains a clearly named test product and a test order.

You can add/edit/delete products; change titles, prices, stock, sizes, badges, specifications, featured status and image URLs; edit campaign copy, page text, photography, contacts, FAQs and policies; inspect order items and shipping addresses; and update fulfillment status. Refresh buttons reload the selected workspace. Saved content refreshes the storefront immediately.

Images accept `/images/...` paths or HTTPS URLs. Place local files inside `public/images`. Uploading to a media storage provider is not configured.

## Activate live management

The intended owner is **gulraizbutt297@gmail.com**. The published contact phone is **+92 331 6841666**.

1. Register the owner through **Your account → Create an account**, or create the account in the project's Supabase Auth dashboard. Confirm the email. Set your password yourself; do not put it in source files or send it in chat.
2. Review and run `scripts/secure-store.sql` in the Supabase SQL editor. It replaces permissive policies on the three store tables, restricts management to the administrator role, and adds the server-authoritative unpaid order-request function. It does not modify product records or grant a user access.
3. Review and run `scripts/authorize-owner.sql` to authorize the confirmed owner account. This only updates the specified user's app metadata. Sign out and back in to refresh the session.
4. Open Store manager and sign in. The live-mode banner distinguishes publishing from local drafts.
5. Validate anonymous/admin access in a staging database before production deployment. Neither SQL file has been executed against the live project during this task.

The role check uses server-controlled `app_metadata`, not editable profile metadata. Browser checks are only an interface gate; database enforcement requires the migration. See [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Orders and payments

Local draft mode supports end-to-end test orders without external writes. Live requests call `submit_order_request`, which recalculates prices and discounts from the catalog and checks sizes and aggregate stock. Direct public access to the order table is revoked by the migration. Requests remain **PENDING / UNPAID** and do not reserve stock. Availability and shipping must be confirmed before payment.

This is an order-request workflow, not a card-payment checkout. A payment provider, verified webhooks, inventory reservations, abuse protection/rate limiting and transactional email still require production integration. If the database function is missing, the form reports that setup is required and preserves the bag.

## Verification

Eight automated tests pass. Browser verification covered admin access gating, local product creation with specifications, content saving, checkout into local orders, fulfillment status persistence, and the photographic belt controls. Production build passes. Live mutations, real sign-in and database policies were not exercised; no owner password or privileged project credential is configured in this workspace.

## Current clothing direction

The newest request replaces the belt collection with **Hoodies, Tracksuits, T-shirts, Fashion, Bags, and Others**. The first localhost visit opens a fresh sample workspace with 12 editable products. See [sample product guide](sample-products.md). Previous belt-draft data is retained separately and is not loaded into this workspace. The old belt and GNZ 3D visuals are no longer displayed. Live owner activation requirements above still apply.
