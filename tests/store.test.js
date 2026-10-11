import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const data = new Map();
globalThis.localStorage = {
  getItem: (key) => data.get(key) || null,
  setItem: (key, value) => data.set(key, value),
  removeItem: (key) => data.delete(key),
};
const { store, PRODUCTS } = await import("../src/store.js");
const { escapeHTML, productCard, imagePath } = await import("../src/ui.js");

test("selected quantities persist and stock limits apply across sizes", () => {
  store.clearCart();
  const product = PRODUCTS.find((p) => p.id === "sample-hoodies-1");
  assert.equal(store.addToCart(product.id, product.sizes[0], 3), true);
  assert.equal(store.loadCart()[0].quantity, 3);
  for (const invalid of [0, -1, 1.5, NaN, Infinity, 100]) {
    assert.equal(store.addToCart(product.id, product.sizes[0], invalid), false);
  }
  const remaining = Math.min(99, product.stock_quantity) - 3;
  assert.equal(store.addToCart(product.id, product.sizes[1], remaining), true);
  assert.equal(store.addToCart(product.id, product.sizes[0], 1), false);
  assert.equal(store.getCartCount(), product.stock_quantity);
  store.clearCart();
});

test("product cards expose bounded quantity selection including sold-out stock", () => {
  for (const stock of [0, 4, 150]) {
    const html = productCard({ ...PRODUCTS[0], stock_quantity: stock }, String);
    const input = html.match(/<input class="card-quantity-input"[^>]*>/)?.[0];
    assert.ok(input);
    assert.ok(input.includes('min="1"'));
    assert.ok(input.includes(`max="${Math.max(1, Math.min(99, stock))}"`));
    assert.ok(input.includes('step="1"'));
    assert.equal(input.includes("disabled"), stock === 0);
  }
});

test("product image rules preserve whole artwork without hover cropping", () => {
  const css = readFileSync(new URL("../src/storefront.css", import.meta.url), "utf8");
  for (const selector of [".card-image-wrap img", ".quick-view-image"]) {
    const declarations = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, selectors]) => selectors.trim() === selector)
      .map(([, , body]) => body).join("\n");
    const fit = [...declarations.matchAll(/object-fit:\s*([^;]+);/g)].at(-1)?.[1];
    assert.equal(fit, "contain", selector);
  }
  assert.match(css, /\.gzn-product-card:hover \.card-image-wrap img\s*\{\s*transform: none;/);
});

test("apparel sizes survive cart persistence and quantity changes", () => {
  store.clearCart();
  const product = PRODUCTS.find((p) => p.id === "sample-hoodies-1");
  store.addToCart(product.id, product.sizes[0]);
  store.updateQuantity(product.id, product.sizes[0], 1);
  assert.equal(store.getCartCount(), 2);
  assert.equal(store.loadCart()[0].size, "S");
  store.removeFromCart(product.id, product.sizes[0]);
  assert.equal(store.getCartCount(), 0);
});
test("discounts never make the total negative and clear with the order", () => {
  store.clearCart();
  store.addToCart("sample-others-12");
  store.applyPromoCode("GENZVIP");
  assert.equal(store.getCartTotal(), 0);
  store.applyPromoCode("CHAMPION10");
  assert.equal(store.getCartTotal(), 16.2);
  store.clearCart();
  assert.equal(store.discountCode, null);
  assert.equal(store.getCartDiscount(), 0);
});
test("corrupt persisted carts and invalid quantities do not enter calculations", () => {
  data.set("gzn_cart", "{}");
  assert.deepEqual(store.loadCart(), []);
  data.set(
    "gzn_cart",
    '[{"id":"a","title":"bad","size":"L","price":1,"quantity":-3}]',
  );
  assert.deepEqual(store.loadCart(), []);
  store.clearCart();
  store.addToCart("sample-hoodies-1", null, -1);
  assert.equal(store.getCartCount(), 0);
});
test("card attributes escape quotes and untrusted markup", () => {
  const html = productCard(
    { ...PRODUCTS[0], title: '<img onerror="bad()">' },
    (n) => `$${n}`,
  );
  assert.ok(html.includes("&lt;img onerror=&quot;bad()&quot;&gt;"));
  assert.ok(html.includes('value="S"'));
  assert.equal(escapeHTML("A&B's"), "A&amp;B&#39;s");
});
test("known local JPEG paths use optimized images; remote paths remain intact", () => {
  assert.equal(
    imagePath("/images/belts/world-heavyweight-belt.jpg"),
    "/images/belts/world-heavyweight-belt.webp",
  );
  assert.equal(
    imagePath("https://example.com/product.jpg"),
    "https://example.com/product.jpg",
  );
});
