# Live database audit — 2026-10-08

## Findings and repairs

The live project had permissive public ALL policies on products, site_settings and orders. The checkout/fulfillment functions and request-key/inventory columns were missing. Applied setup_database.sql, secure-store.sql and media-storage.sql using a verified TLS connection. Existing product and order records were retained.

## Verified on the live database

- Admin product create/update and settings writes succeed.
- Invalid prices and empty size lists fail database validation.
- Anonymous catalog/settings reads succeed; anonymous writes and order reads fail.
- Guest checkout computes authoritative totals and accepts valid requests.
- Replaying a request key returns the same order, avoiding duplicate creation.
- Non-admin authenticated users cannot read or fulfill orders.
- PROCESSING deducts stock once; cancellation restores it once. Invalid status transitions fail.
- Products, settings and orders belong to the realtime publication. This checks publication configuration, not end-to-end websocket delivery.
- All audit fixtures are rolled back. No test records remain.

The actual Supabase HTTP API also passed public catalog reads, anonymous order-read rejection, checkout RPC validation, and authenticated owner order reads.

The live catalog retains 8 records, including 5 retired-category records excluded by the current storefront. There is 1 existing order. No products have null/negative prices or stock. Retired records were not deleted or replaced with sample inventory.

Product-image storage was separately verified with an owner upload, public photo download, anonymous upload rejection and test-file cleanup.

## Reproduce

Configure the ignored .env.backend with the database connection and SUPABASE_CA_FILE, then run:

```sh
npm run backend:check
npm run backend:audit
npm test
```

The audit performs temporary SQL writes inside one transaction and rolls them back. Run it when it will not conflict with maintenance or migrations.

## Scope limits

This confirms the implemented unpaid order-request workflow, not a complete paid-commerce deployment. Card payment, refund, shipping-rate and transactional order-email integrations remain unconfigured. Password recovery delivery and browser interactions were not tested in this audit. Legacy order inventory needs reconciliation before changing old fulfillment statuses. The request throttle is per email, not comprehensive bot protection. Previously permissive policies do not establish whether any unauthorized access occurred; access-history review is separate.
