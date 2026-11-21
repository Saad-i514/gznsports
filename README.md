# GZNSPORTS — Your Day. Your Way.

A responsive clothing and accessories storefront with six collections: **Hoodies, Tracksuits, T-shirts, Fashion, Bags, and Others**.

```sh
npm install
npm run dev
npm test
npm run build
```

The first localhost visit starts an editable sample workspace with 12 fictional listings. A sample-store banner distinguishes it from live publishing. Use **Store manager → Products & collections** to replace products and **Storefront & hero editor** to change page copy and images. Samples and test orders persist in this browser only. Exiting the local draft restores the live data connection.

Product colors use a dropdown with removable chips, including custom color names. Product descriptions, page copy, hero subheadings and policies offer visual Bold/Italic controls. Saved copy permits only bare emphasis tags; other HTML is displayed as text, and pasted editor content is plain text. Existing color names are preserved; replace an accidentally combined name such as “Black Red Yellow” with individual selections.

See [sample product guide](docs/sample-products.md) for the fields and sources used, and [admin guide](docs/admin-guide.md) for live owner activation.

Public information pages use `/contact`, `/shipping`, `/returns`, `/privacy`, `/terms`, and `/promotions`; order lookup uses `/tracking` and store management uses `/admin`. Old `?page=...` and `/#admin` bookmarks are normalized in the browser. Back/Forward and closing routed panels keep the address in sync. The build emits per-page HTML metadata, and `vercel.json` maps these paths to those files; another hosting provider must serve the same mappings. Admin code loads only when requested, and admin/tracking pages are marked `noindex`.

The retired belt collection is excluded from the storefront, search, local carts, and management catalog. Existing remote records and historical orders were not deleted. Legacy campaign settings cannot override this clothing direction.

Live admin and order requests require the Supabase migrations and owner activation described in the admin guide. Run `npm run backend:migrate`, `npm run backend:check`, then `npm run backend:owner` with private local configuration. Never place private credentials in browser environment variables.

Stripe-hosted sandbox Checkout is implemented behind a disabled feature flag. See [sandbox payments setup and verification](docs/stripe-payments.md) for the separate database, Vercel configuration, webhook and reconciliation requirements. `npm run payments:smoke` verifies real sandbox session creation and expiry against an isolated in-memory database. It does not submit payment or touch production data. Payment deployment, external webhook delivery and order email remain unconfigured.
