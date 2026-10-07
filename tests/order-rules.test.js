import test from "node:test";
import assert from "node:assert/strict";
import { createDraftApi } from "../src/lib/draft-store.js";
test("draft requests reject forged totals, retry safely and restore cancelled stock once", async () => {
  const saved = new Map();
  const api = createDraftApi(
    { getItem: (k) => saved.get(k), setItem: (k, v) => saved.set(k, v) },
    {
      products: [
        { id: "tee", title: "Tee", price: 25, stock_quantity: 2, sizes: ["M"] },
      ],
      settings: {},
      orders: [],
    },
  );
  const payload = {
    request_key: crypto.randomUUID(),
    customer_name: "Buyer",
    customer_email: "test@example.com",
    shipping_address: { address: "Test street" },
    items: [{ id: "tee", size: "M", quantity: 2 }],
    total: 50,
  };
  await assert.rejects(
    api.createOrder({ ...payload, total: 1 }),
    /Prices changed/,
  );
  const order = await api.createOrder(payload);
  assert.equal((await api.createOrder(payload)).id, order.id);
  assert.equal((await api.fetchOrders()).length, 1);
  await api.updateOrderStatus(order.id, "PROCESSING");
  assert.equal((await api.fetchProducts())[0].stock_quantity, 0);
  await api.updateOrderStatus(order.id, "CANCELLED");
  await api.updateOrderStatus(order.id, "CANCELLED");
  assert.equal((await api.fetchProducts())[0].stock_quantity, 2);
  await assert.rejects(
    api.updateOrderStatus(order.id, "DELIVERED"),
    /Invalid fulfillment/,
  );
});
