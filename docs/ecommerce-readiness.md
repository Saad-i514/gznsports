# Ecommerce readiness

Implemented: corrected GZN branding; per-product handling-time ranges; additional product photos; editable contact, shipping, return, privacy and sale-policy content; customer order history; private guest tracking codes and downloadable confirmations; admin carrier tracking; explicit item totals and currency estimates; hosting security headers; admin launch checklist.

## Database rollout
Apply `scripts/commerce-essentials.sql` to the store database before enabling customer tracking. It is additive and repeatable; it adds columns, an index and narrowly scoped RPCs without resetting catalog or orders. No production migration was run for this change. Existing order requests continue through the legacy RPC until migration is applied, with support-based tracking. Existing guest orders do not have a customer-issued tracking code; support must verify the customer before assisting. Signed-in history contains orders created while signed in, not orders matched by email.

Do not run the Stripe sandbox migration against the production database. See stripe-payments.md for isolated sandbox setup. The full backend:migrate command is for base store setup; applying secure-store.sql after Stripe setup replaces its fulfillment function, so follow the Stripe migration order for that separate environment.

## Still required before accepting real online payments
- Publish actual business identity/address, support details, destinations, shipping charges, delivery estimates and return/refund terms in Store policies & launch. Have the legal/privacy terms reviewed for the business and markets served.
- Replace sample catalog photography and descriptions, confirm sizes, stock and handling time.
- Complete live payment integration, signed webhook delivery, shipping/tax calculations, refund/cancellation operations, and an end-to-end live checkout verification. Current Stripe code intentionally supports sandbox only.
- Configure and verify transactional order/dispatch emails. Downloadable confirmations are available, but automatic emails are not implemented.
- Verify hosting/domain/HTTPS, account email delivery/recovery, backups/restoration, monitoring and abuse controls; test mobile, keyboard and assistive-technology flows before launch.
- Verify all published policy and contact content. An entered checklist field is not evidence of legal compliance or a verified service. No finite checklist guarantees that every business or jurisdiction requirement is covered.

The checklist follows the customer information and store testing topics in [Stripe's website checklist](https://docs.stripe.com/get-started/checklist/website) and [Shopify's store-design checklist](https://help.shopify.com/en/manual/intro-to-shopify/store-design).
