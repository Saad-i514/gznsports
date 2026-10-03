# Sample catalog and replacement guide

GNZSPORTS now covers Hoodies, Tracksuits, T-shirts, Fashion, Bags, and Others. The sample workspace includes two products per category (12 total). Names, prices, inventory, dimensions and material claims are fictional. Illustrations are original placeholders; the existing hoodie photos remain editorial imagery.

## Replace a product

1. Open **Store manager → Products & collections**.
2. Edit a sample, or select **Add new product**.
3. Enter its title, category, price in USD, stock, badge, image path/HTTPS URL, comma-separated sizes/options and description.
4. Use **Specifications** for one `Label: Value` per line. Recommended labels: `SKU`, `Color`, `Material`, `Fit`, and `Care`. For tracksuits add `Includes`; for bags add `Dimensions`, `Capacity`, `Compartments` and `Straps` as applicable.
5. Replace `SAMPLE PRODUCT` with your actual badge after all values and imagery are verified. Save and inspect the storefront.

Sizes are selectable purchase options. Color is currently a product specification: create separate products for different colorways. Stock is tracked per product, not per size/color combination. Images use a path inside `public/images` or an HTTPS URL; media uploading is not configured.

## Field research

The field structure was informed by official product listings, not copied product identities or photography:

- [Nike Sportswear T-shirt](https://www.nike.com/t/sportswear-mens-t-shirt-MK2TR1/AR5004-411): apparel sizing and fit sections.
- [Adidas Stadium tracksuit](https://www.adidas.com/bh/en/stadium-3-stripes-tracksuit/JN1817.html): fit and separate top/bottom material details.
- [Nike Aura backpack](https://www.nike.com/t/aura-backpack-24l-p4K52r/HF7007-013): capacity, dimensions, body/lining materials, straps and care.

Sample prices and measurements are invented for layout testing, not quotations from those brands.

## Data and launch status

- The first localhost visit initializes the new sample workspace. Its browser storage is separate from the retired belt draft.
- Local changes never publish to Supabase. Use the live administrator workflow in admin-guide.md for production changes.
- `scripts/sample-catalog.sql` is an optional, unexecuted staging seed. It inserts samples without overwriting existing IDs.
- No remote products were deleted or seeded. The current category filter suppresses legacy belt listings in both public and admin catalog views; historical orders remain intact.
- `scripts/secure-store.sql` and `scripts/authorize-owner.sql` still require review and execution in the owner’s Supabase project. The intended owner remains gulraizbutt297@gmail.com.

## Validation

11 automated tests pass, covering six-category consistency, valid sample products and assets, retired-product exclusion, product validation, local CRUD, order selection, cart persistence, discounts and safe markup. The production build passes. A fresh browser visual check was blocked by the browser tool’s URL security policy during this update; the new layout has not been visually verified in that run.
