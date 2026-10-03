# GNZSPORTS — Earned. Never Given.

A responsive storefront for championship belts and premium hoodies, built with modular JavaScript, Vite, Three.js, and the existing Supabase integration.

## Local development

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`) for your Supabase project. The existing client retains its project fallback. Never put private database credentials in browser environment variables.

## Experience

- Editorial campaign, collection navigation, searchable/filterable catalog, product options, persistent bag, discounts, and unpaid order review.
- Lazy-loaded interactive 3D belt material study with keyboard controls and a static image fallback.
- Responsive navigation, focus-managed dialogs, reduced-motion support, and optimized WebP photography.
- Existing account, catalog synchronization, and store-management integrations.

See [creative direction](docs/creative-direction.md) for the visual system, UX, camera, materials, motion, and implementation architecture. See [validation](docs/validation.md) for completed checks.

## Before launch

This is a locally verified frontend, not a payment-ready production backend. Harden the existing public Supabase policies, rotate credentials present in migration scripts/history, and implement server-authoritative price/stock validation and verified payment webhooks before accepting public transactions. Confirm product claims and operational policies. No live database migration or payment integration was performed.

## Store management update

The craft section now defaults to the World Heavyweight belt photograph; the conceptual GNZ 3D belt is no longer loaded. Tabs/arrows select photographic details. The admin panel includes content and image editing, local drafts and gated live access. See [admin guide](docs/admin-guide.md) for owner setup and database migration requirements.
