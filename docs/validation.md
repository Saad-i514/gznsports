# Validation — GNZSPORTS redesign

- Production Vite build completed successfully.
- Five Node tests cover cart persistence and quantities, promotion totals/reset, invalid persisted data, safe product markup, and local image mapping.
- Browser checks at desktop and 390px mobile: hero, responsive menu, collections, catalog filters, product details/options, bag quantity changes, discount totals, and unpaid order review.
- Search markup injection renders as text. Escape closes search and returns focus.
- Material-study tabs work with clicks and arrow keys; the 3D gold seal renders correctly.
- Storefront editor opens with the new campaign defaults. No settings were published during testing.
- No live orders, account changes, payments, or database writes were submitted.

Automated tests do not establish backend security, payment readiness, or compatibility across every browser/device. Launch dependencies are recorded in creative-direction.md.

## Follow-up functionality verification

- Replaced the conceptual GNZ WebGL object with the requested World Heavyweight photograph; previous/next/reset controls and keyboard tabs select detail crops.
- Browser-tested protected admin entry, local draft product creation, content saving, storefront product details, test order creation, and persisted fulfillment status after refresh.
- At 390px, the document stays within viewport width; belt detail controls remain usable.
- Eight automated tests and the production build pass. Live sign-in, security migration and real orders remain unverified until owner setup; see admin-guide.md.

## Motion and automatic updates
- Hero: staggered entrance, slow photographic zoom/pan, moving light, scroll cue, pause button. Reduced-motion users get a static hero; continuous effects pause offscreen and in hidden tabs.
- Storefront content: Supabase realtime plus fresh catalog/settings checks every 15 seconds while visible and online. Returning to the tab or reconnecting triggers an immediate check. Local draft edits propagate through the existing storage/save events. Unchanged results do not redraw content; overlapping requests are serialized.
- Live updates require the existing Supabase catalog/settings read policies. Realtime publication enables immediate events; polling still works without that publication. Local sample mode reads local drafts, not the live database.
- Production builds include version.json. Deploy it alongside the bundle and index.html. Every 60 seconds the app checks for a new build and automatically reloads when dialogs are closed and no field is being edited. Cart data remains in local storage. Development uses Vite HMR.
- Validation: 14 Node tests passed; production build passed. Browser animation appearance was not visually verified because the browser tool previously rejected access under its URL policy.
