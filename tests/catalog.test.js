import test from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, isCurrentProduct } from "../src/catalog.js";
import { SAMPLE_PRODUCTS } from "../src/sample-products.js";
import { validateProduct } from "../src/lib/commerce-validation.js";
import { storefront } from "../src/views/storefront.js";
import { readFileSync } from "node:fs";

test("all six collections have two editable valid sample listings and local photographs", () => {
  assert.deepEqual(
    CATEGORIES.map((c) => c.id),
    ["hoodies", "tracksuits", "tshirts", "fashion", "bags", "others"],
  );
  for (const category of CATEGORIES) {
    const products = SAMPLE_PRODUCTS.filter((p) => p.category === category.id);
    assert.equal(products.length, 2);
    for (const p of products) {
      assert.doesNotThrow(() => validateProduct(p));
      assert.equal(isCurrentProduct(p), true);
      assert.ok(p.specs.some((s) => s.label === "Color"));
      assert.ok(p.specs.some((s) => s.label === "SKU"));
      const bytes = readFileSync(
        new URL("../public" + p.image, import.meta.url),
      );
      assert.equal(bytes[0], 0xff);
      assert.equal(bytes[1], 0xd8);
      assert.ok(bytes.length > 10000);
    }
  }
});
test("retired products cannot reappear from the legacy backend", () => {
  assert.equal(
    isCurrentProduct({ id: "old", category: "belts", title: "Championship" }),
    false,
  );
  assert.equal(
    isCurrentProduct({
      id: "old-belt-case",
      category: "bags",
      title: "Travel case",
    }),
    false,
  );
  assert.equal(
    isCurrentProduct({
      id: "new",
      category: "bags",
      title: "Everyday Backpack",
    }),
    true,
  );
});
test("storefront navigation, filters and collection cards use the same category IDs", () => {
  const html = storefront();
  for (const c of CATEGORIES) {
    assert.ok(html.includes(`data-cat="${c.id}"`));
    assert.ok(html.includes(`data-category="${c.id}"`));
  }
  assert.doesNotMatch(html, /championship|\bbelts?\b|hero-dual-showcase/i);
});
