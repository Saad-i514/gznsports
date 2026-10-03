import test from "node:test";
import assert from "node:assert/strict";
const data = new Map();
globalThis.localStorage = {
  getItem: (key) => data.get(key) || null,
  setItem: (key, value) => data.set(key, value),
  removeItem: (key) => data.delete(key),
};
const { store, PRODUCTS } = await import("../src/store.js");
const { escapeHTML, productCard, imagePath } = await import("../src/ui.js");

test("quoted belt editions survive cart persistence and quantity changes", () => {
  store.clearCart();
  const product = PRODUCTS.find((p) => p.id === "genz-undisputed-belt");
  store.addToCart(product.id, product.sizes[0]);
  store.updateQuantity(product.id, product.sizes[0], 1);
  assert.equal(store.getCartCount(), 2);
  assert.equal(store.loadCart()[0].size, 'OFFICIAL REPLICA (52")');
  store.removeFromCart(product.id, product.sizes[0]);
  assert.equal(store.getCartCount(), 0);
});
test("discounts never make the total negative and clear with the order", () => {
  store.clearCart();
  store.addToCart("genz-belt-wall-mount");
  store.applyPromoCode("GENZVIP");
  assert.equal(store.getCartTotal(), 0);
  store.applyPromoCode("CHAMPION10");
  assert.equal(store.getCartTotal(), 40.5);
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
  store.addToCart("genz-undisputed-belt", null, -1);
  assert.equal(store.getCartCount(), 0);
});
test("card attributes escape quotes and untrusted markup", () => {
  const html = productCard(
    { ...PRODUCTS[0], title: '<img onerror="bad()">' },
    (n) => `$${n}`,
  );
  assert.ok(html.includes("&lt;img onerror=&quot;bad()&quot;&gt;"));
  assert.ok(html.includes("OFFICIAL REPLICA (52&quot;)"));
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
