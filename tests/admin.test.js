import test from "node:test";
import assert from "node:assert/strict";
import { createDraftApi } from "../src/lib/draft-store.js";
import {
  validateProduct,
  validateSelection,
} from "../src/lib/commerce-validation.js";

test("draft CRUD persists without changing source catalog and supports content and orders", async () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key),
    setItem: (key, value) => data.set(key, value),
  };
  const api = createDraftApi(storage);
  const product = await api.createProduct({
    title: "Test tee",
    price: 99,
    stock_quantity: 4,
    sizes: "M, L",
    image: "/images/test.webp",
    category: "tshirts",
  });
  await api.updateProduct(product.id, {
    title: "Updated tee",
    price: 109,
    stock_quantity: 0,
  });
  assert.equal((await api.fetchProducts())[0].title, "Updated tee");
  assert.equal((await api.fetchProducts())[0].stock_quantity, 0);
  await api.saveSiteSetting("page_content", { story_title: "A new chapter" });
  assert.equal(
    (await api.fetchSiteSettings()).page_content.story_title,
    "A new chapter",
  );
  const order = await api.createOrder({
    items: [],
    total: 99,
    payment_status: "UNPAID",
    status: "PENDING",
  });
  await api.updateOrderStatus(order.id, "PROCESSING");
  assert.equal((await api.fetchOrders())[0].status, "PROCESSING");
  assert.equal((await api.getDashboardMetrics()).totalRevenue, 0);
  assert.equal((await createDraftApi(storage).fetchProducts())[0].price, 109);
  await api.deleteProduct(product.id);
  assert.equal((await api.fetchProducts()).length, 0);
});
test("product validation rejects invalid money, stock, sizes and unsafe image protocols", () => {
  for (const patch of [
    { price: -1 },
    { stock_quantity: 1.5 },
    { sizes: "" },
    { image: "javascript:alert(1)" },
    { category: "unknown" },
  ])
    assert.throws(() => validateProduct(patch));
  assert.doesNotThrow(() =>
    validateProduct({
      title: "Tee",
      price: 0,
      stock_quantity: 0,
      sizes: '52"',
      image: "/images/belt.webp",
      category: "tshirts",
    }),
  );
});
test("order selection uses current prices and checks aggregated stock across editions", () => {
  const products = [
    {
      id: "p",
      title: "Tee",
      price: 100,
      stock_quantity: 2,
      sizes: ["M", "L"],
    },
  ];
  assert.equal(
    validateSelection(
      [{ id: "p", size: "M", quantity: 1, price: 1 }],
      products,
    )[0].price,
    100,
  );
  assert.throws(
    () =>
      validateSelection(
        [
          { id: "p", size: "M", quantity: 2 },
          { id: "p", size: "L", quantity: 1 },
        ],
        products,
      ),
    /Only 2/,
  );
  assert.throws(
    () => validateSelection([{ id: "p", size: "XL", quantity: 1 }], products),
    /available size/,
  );
  assert.throws(
    () =>
      validateSelection([{ id: "removed", size: "M", quantity: 1 }], products),
    /no longer available/,
  );
});
