# GNZSPORTS — Earned. Never given.

## The idea

Championship spirit, everyday expression. GNZSPORTS connects the ceremonial weight of a championship belt with the everyday weight of premium cotton. The customer is a belt collector, wrestling enthusiast, or streetwear buyer who values presence, material, and identity. The primary conversion is finding a piece, choosing its edition or size, and completing an order request. The user confirmed that belts and premium hoodies remain the core offer.

## Reference analysis

[RDX Sports](https://rdxsports.com/) was inspected in the browser. Its strengths are immediate sport-based navigation, a high-impact campaign hero, category tiles, filtered trending products, new releases, and shopping reassurance. Its homepage also uses strong red/black contrast and condensed campaign typography. Those are useful commerce principles, not a visual template to reproduce.

GNZSPORTS narrows the navigation to its actual assortment and introduces a quieter editorial cadence. Fewer competing promotions, larger negative space, more deliberate material storytelling, and an original typographic mark distinguish the experience. RDX assets, endorsements, customer counts, and certifications are not reused.

## Visual identity

**Mood:** focused, substantial, confident; the quiet before a championship entrance. Copy is short and human. Product descriptions carry the specifications, while campaign headlines carry emotion.

| Role             | Color     | Use                                                            |
| ---------------- | --------- | -------------------------------------------------------------- |
| Ink              | `#161714` | Navigation, footer, typography, dark CTAs                      |
| Warm ivory       | `#F3F1EB` | Collection canvas, dialogs, readable product surfaces          |
| Vermilion        | `#F14B2C` | Primary action, campaign emphasis, active indicators           |
| Muted olive gray | `#686963` | Supporting copy and specifications                             |
| Mineral line     | `#D5D5CC` | Quiet dividers and input outlines                              |
| Aged gold        | `#B3A57F` | Material-story accent; product metal remains the dominant gold |

Typography pairs **Barlow Condensed 600–800** for monumental headlines with **Inter 400–700** for commerce and reading. **Space Mono** is used sparingly for section numbers and specifications. Headlines use tight leading, but body copy remains comfortably spaced. The original vector GNZSPORTS wordmark is deliberately flat and compact so it does not compete with dimensional products.

Composition uses an approximately 4% desktop gutter, generous section spacing, paired collection images, and a four-column product grid. Mobile uses a 5% gutter, single-column storytelling, and a two-column catalog. Numbered sections establish continuity. Dark cinematic passages alternate with light shopping surfaces.

## Imagery, lighting, and camera language

The opening photograph gives the belt scale and context. A left-side gradient reserves negative space for the headline; the product sits right of center. Warm highlights define the metal against charcoal fabric and a deep arena background. Use the existing supplied assets, compressed to WebP, rather than introducing unrelated stock imagery.

Future photography should use a restrained palette: brushed brass, black leather, dense cotton, and worn mineral surfaces. Hero compositions should feel like a 50–70mm product portrait with a low three-quarter angle. Catalog photography should keep product scale consistent and use a normal-lens perspective. Material details should use close, raking illumination that shows relief and weave. Avoid fisheye distortion, floating decorative shapes, excessive bloom, or gold UI chrome.

Existing product imagery remains subject to the store owner's verification that it accurately depicts the goods. The GNZ 3D study is explicitly labeled as a design visualization.

## 3D environment

The story object is a championship belt. Photography owns the first frame; an actual Three.js material study appears beside the craftsmanship explanation. This keeps the primary shopping experience immediate while giving 3D a clear educational purpose.

- **Silhouette:** substantial leather strap, beveled central shield, paired side medallions, brass snaps, and a bespoke GNZ center seal.
- **Materials:** high-roughness near-black leather with a subtle procedural grain; warm metallic brass with a satin surface; darker recessed metal for contrast.
- **Lighting:** a broad warm key, a cooler edge light, and generated softbox environment reflections. No external HDR dependency.
- **Camera:** 33° field of view, slight downward and three-quarter orientation, a restrained diagonal. Camera distance adapts to the container so the normal view fits.
- **Depth:** leather foundation behind the raised plate assembly, inset seal, raised borders and hardware. The “foundation” tab separates the plate layer along Z; the “detail” tab moves closer.
- **Interaction:** horizontal drag, bounded vertical rotation on mouse, touch-friendly horizontal manipulation, keyboard-operable rotation/reset buttons, and accessible material tabs.
- **Fallback:** the product photograph remains if WebGL cannot initialize or loses context.

The viewer renders when an interaction, resize, or visibility change requires it. It suspends offscreen and in hidden tabs, caps device pixel ratio at 1.5, and imports its Three.js chunk only near the section. There is no perpetual decorative spin or particle field.

## Experience architecture

1. **Orientation:** a short announcement and persistent navigation with collection links, search, account, currency, and bag. The management entry is in the footer.
2. **Campaign:** “Earned. Never given.” establishes identity. One primary shopping action and one secondary craftsmanship link.
3. **Collection choice:** belts and heavyweight essentials, each presented as a photographic editorial card.
4. **Shopping:** all pieces, belts, hoodies, and accessories; explicit size/edition selection; price sorting; direct bag action; keyboard-accessible product details.
5. **Craftsmanship:** three material tabs linked to the construction study. Specific, inspectable details replace vague luxury language.
6. **Apparel story:** a quieter textile editorial with a product-specific weight note and direct hoodie link.
7. **Brand mindset:** a short statement about process and intent.
8. **Reassurance:** shipping context, specifications, and a working sizing/care help dialog.
9. **Closing invitation:** a final campaign-scale headline and direct collection CTA, followed by a functional footer.

No invented reviews, athlete endorsements, sales counters, or artificial urgency are introduced. The old unverifiable testimonials and simulated audio quotes were removed. A future social-proof section should use consented customer photographs, verified purchase reviews, and documented partnerships once supplied.

## Motion choreography

| Moment           | Choreography                                                                | Timing                                       |
| ---------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| First frame      | Headline group fades in and rises 20px                                      | 900ms, `cubic-bezier(.22,1,.36,1)`           |
| Scroll reveal    | Each editorial group rises 24px once at 8% visibility                       | 750ms, same easing                           |
| Hero depth       | Image drifts at 13% of scroll, capped at 100px                              | Scroll-linked, one scheduled animation frame |
| Collection hover | Image scales to 1.035; circular arrow turns                                 | 800ms image / 300ms arrow                    |
| Product hover    | Image scales to 1.045; add button inverts                                   | 650ms image / 200ms control                  |
| Material change  | Rotation, scale, and plate separation interpolate toward the selected state | Damped settling; no continuous idle loop     |
| Drawer/dialog    | Existing short slide/fade, consistent surface styling                       | Approximately 250–400ms                      |
| Feedback         | Text confirmation and persistent cart quantity change                       | Immediate; toast clears after 3.5s           |

Native scrolling remains intact. Reduced-motion mode removes reveals, parallax, and transitions and makes material changes immediate. There are no full-screen loading gates. No custom cursor replaces the OS pointer; drag affordances stay local to the viewer. Primary campaign buttons have a very small magnetic response (at most 2.5px in each axis), only for a precise mouse pointer; it is disabled in reduced-motion mode and resets on blur or pointer exit.

## Accessibility and responsive behavior

Skip link, semantic main/nav/section landmarks, native buttons and selects, visible focus indicators, accessible dialog names, focus trapping and restoration, inert closed dialogs, Escape dismissal, arrow-key material tabs, live cart/search feedback, mobile menu state, and opt-in audio are included. Mobile layouts remove ornamental copy before shrinking important controls. The photographic hero remains available without WebGL.

## Code ownership

The project retains Vite and vanilla ES modules to preserve the existing Supabase integration without an unnecessary framework migration.

- `src/views/storefront.js`: page composition.
- `src/views/cart.js`: persistent bag shell.
- `src/ui.js`: icons, vector wordmark, escaped product cards, image mapping.
- `src/main.js`: commerce orchestration, filtering, sorting, product details, order review, and synchronization.
- `src/experience.js`: responsive navigation, motion, accessible dialogs, lazy viewer loading.
- `src/material-studio.js`: isolated Three.js scene and lifecycle.
- `src/storefront.css`: campaign tokens, layouts, responsive rules, and shared component finish.
- Existing store, Supabase API, real-time engine, and management console remain integrated.

The old campaign settings do not override the new first frame. Publishing from the hero editor adds `visual_direction: earned`, after which the new headline, subhead, and primary CTA synchronize through the existing settings API.

## Launch dependencies

The frontend is implemented and locally verifiable; this does not establish a production-safe backend. Before public transactions:

- Replace permissive public database write/read policies with reviewed, role-based authorization and customer-owned order access. The existing SQL currently grants broad public access; this redesign does not run migrations or change the live database.
- Rotate the database credentials already present in migration scripts/history and move operational secrets into server-side environment configuration.
- Add a server-authoritative price/inventory check and payment provider with verified webhooks. The UI now records **unpaid, pending order requests**, not fictional successful payments.
- Confirm product specifications, image accuracy, shipping promises, approved policy text, and the operational process for responding to order requests.
- Supply verified social proof and any required brand/licensing evidence for product imagery and naming.

No deployment, live order, authentication change, or database mutation was performed as part of visual verification.
