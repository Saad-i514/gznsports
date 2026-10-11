import test from "node:test";
import assert from "node:assert/strict";

import Stripe from "stripe";
import {
  paymentConfig,
  normalizePayload,
  checkoutParams,
  createCheckout,
  checkoutStatus,
  processStripeEvent,
} from "../server/payments.js";
import { checkoutHandler, webhookHandler } from "../server/payment-http.js";
import {
  checkoutRequestKey,
  settleCheckoutCart,
} from "../src/lib/stripe-checkout.js";

import { sandboxDatabase } from "../scripts/payment-fixture.js";
const payload = (extra = {}) => ({
  request_key: crypto.randomUUID(),
  customer_name: "Sandbox Buyer",
  customer_email: "sandbox@example.com",
  shipping_address: { address: "Test address" },
  items: [{ id: "tee", size: "M", quantity: 2, price: 1 }],
  total: 50,
  ...extra,
});
function fakeStripe() {
  const sessions = new Map(),
    keys = new Map();
  let calls = 0;
  const sdk = new Stripe("sk_test_fixture");
  return {
    sessions,
    keys,
    webhooks: sdk.webhooks,
    get calls() {
      return calls;
    },
    checkout: {
      sessions: {
        async create(params, options) {
          calls++;
          if (keys.has(options.idempotencyKey)) {
            const previous = keys.get(options.idempotencyKey);
            assert.deepEqual(params, previous.params);
            return sessions.get(previous.id);
          }
          const id = `cs_test_${crypto.randomUUID().replaceAll("-", "")}`;
          const session = {
            id,
            mode: "payment",
            status: "open",
            payment_status: "unpaid",
            livemode: false,
            currency: "usd",
            metadata: params.metadata,
            client_reference_id: params.client_reference_id,
            amount_total: params.line_items.reduce(
              (sum, line) => sum + line.quantity * line.price_data.unit_amount,
              0,
            ),
            url: `https://checkout.stripe.com/c/pay/${id}`,
          };
          keys.set(options.idempotencyKey, { id, params });
          sessions.set(id, session);
          return session;
        },
        async retrieve(id) {
          if (!sessions.has(id)) throw Error("Unknown session");
          return { ...sessions.get(id) };
        },
      },
    },
  };
}
const eventFor = (s, type = "checkout.session.completed") => ({
  id: `evt_${crypto.randomUUID()}`,
  type,
  livemode: false,
  data: { object: { ...s } },
});
const config = {
  origin: "http://localhost:5173",
  webhookSecret: "whsec_fixture",
};

test("sandbox configuration fails closed for missing config and live keys", () => {
  const env = {
    STRIPE_PAYMENTS_ENABLED: "true",
    STRIPE_SECRET_KEY: "sk_test_fixture",
    STRIPE_DATABASE_URL: "postgres://localhost/test",
    STRIPE_SANDBOX_DATABASE_CONFIRMED: "true",
    STRIPE_WEBHOOK_SECRET: "whsec_fixture",
    SITE_URL: "https://example.com",
  };
  assert.equal(paymentConfig(env).origin, "https://example.com");
  for (const patch of [
    { STRIPE_SECRET_KEY: "sk_live_fixture" },
    { STRIPE_WEBHOOK_SECRET: "" },
    { STRIPE_PAYMENTS_ENABLED: "false" },
    { STRIPE_SANDBOX_DATABASE_CONFIRMED: "false" },
    { SITE_URL: "http://unsafe.example" },
    {
      STRIPE_DATABASE_URL:
        "postgres://postgres.xoizeqnphqtjjyodcfwk@pooler.example/database",
    },
  ])
    assert.throws(() => paymentConfig({ ...env, ...patch }));
  for (const patch of [
    { items: [] },
    { total: 0 },
    { total: NaN },
    { request_key: "bad" },
    { items: [{ id: "tee", size: "M", quantity: 1.1 }] },
  ])
    assert.throws(() => normalizePayload(payload(patch)));
});

test("discount allocation matches the exact payable cents across quantities", () => {
  for (const discount of [0, 0.01, 0.03, 1.01, 10.17, 49.5]) {
    const order = {
      id: crypto.randomUUID(),
      created_at: new Date(),
      customer_email: "test@example.com",
      subtotal: 50,
      discount,
      items: [
        { title: "Tee", size: "M", price: 8.33, quantity: 3 },
        { title: "Top", size: "L", price: 12.505, quantity: 2 },
      ],
    };
    // Real database prices always have at most two decimal places.
    order.items[1].price = 12.5;
    order.subtotal = 49.99;
    const params = checkoutParams(order, config.origin);
    assert.equal(
      params.line_items.reduce(
        (s, l) => s + l.quantity * l.price_data.unit_amount,
        0,
      ),
      4999 - Math.round(discount * 100),
    );
    assert.ok(params.line_items.every((l) => l.price_data.unit_amount >= 0));
  }
});

test("checkout reserves atomically, uses database pricing, retries safely and fulfills once", async () => {
  const db = await sandboxDatabase(),
    stripe = fakeStripe(),
    deps = { pool: db, stripe, config };
  try {
    await assert.rejects(
      createCheckout(payload({ total: 2 }), deps),
      /Prices changed/,
    );
    const request = payload();
    const result = await createCheckout(request, deps);
    assert.deepEqual(await createCheckout(request, deps), result);
    assert.equal(stripe.calls, 1);
    const stock = async () =>
      (await db.query("SELECT stock_quantity FROM products")).rows[0]
        .stock_quantity;
    assert.equal(await stock(), 3);
    await assert.rejects(
      createCheckout({ ...request, customer_name: "Changed" }, deps),
      /Request changed/,
    );
    await assert.rejects(
      createCheckout(
        payload({ items: [{ id: "tee", size: "L", quantity: 4 }], total: 100 }),
        deps,
      ),
      /Insufficient stock/,
    );
    const session = stripe.sessions.get(result.session_id);
    assert.equal(session.amount_total, 5000);
    await db.exec("SET ROLE anon");
    await assert.rejects(
      db.query("SELECT reserve_stripe_order($1)", [JSON.stringify(request)]),
      /permission denied/,
    );
    await assert.rejects(
      db.query("SELECT * FROM stripe_events"),
      /permission denied/,
    );
    await db.exec(
      'RESET ROLE; SELECT set_config(\'request.jwt.claims\',\'{"app_metadata":{"role":"admin"}}\',false)',
    );
    const orderId = session.metadata.order_id;
    await assert.rejects(
      db.query("SELECT transition_order($1,'PROCESSING')", [orderId]),
      /confirmed payment/,
    );
    session.status = "complete";
    const pending = eventFor(session);
    await processStripeEvent(pending, deps);
    assert.equal(
      (await checkoutStatus(session.id, deps)).payment_status,
      "PROCESSING",
    );
    session.payment_status = "paid";
    const paid = eventFor(session, "checkout.session.async_payment_succeeded");
    await processStripeEvent(paid, deps);
    await processStripeEvent(paid, deps);
    await processStripeEvent(
      eventFor(session, "checkout.session.expired"),
      deps,
    );
    assert.equal(
      (await checkoutStatus(session.id, deps)).payment_status,
      "PAID",
    );
    assert.equal(await stock(), 3);
    await db.query("SELECT transition_order($1,'PROCESSING')", [orderId]);
    assert.equal(await stock(), 3); // No second decrement when admin confirms.
    await assert.rejects(
      db.query("SELECT transition_order($1,'CANCELLED')", [orderId]),
      /refund reconciliation/,
    );
    await db.query("SELECT transition_order($1,'DISPATCHED')", [orderId]);
    assert.deepEqual(
      Object.keys(await checkoutStatus(session.id, deps)).sort(),
      ["payment_status", "reference"],
    );
  } finally {
    await db.close();
  }
});

test("expired/failed sessions release stock once, amount tampering rolls back, unknown events do nothing", async () => {
  const db = await sandboxDatabase(),
    stripe = fakeStripe(),
    deps = { pool: db, stripe, config };
  try {
    for (const failed of [false, true]) {
      const result = await createCheckout(payload(), deps),
        session = stripe.sessions.get(result.session_id);
      session.amount_total = 1;
      await assert.rejects(
        processStripeEvent(eventFor(session), deps),
        /does not match/,
      );
      session.amount_total = 5000;
      await processStripeEvent(eventFor(session, "customer.created"), deps);
      session.status = failed ? "complete" : "expired";
      const event = eventFor(
        session,
        failed
          ? "checkout.session.async_payment_failed"
          : "checkout.session.expired",
      );
      await processStripeEvent(event, deps);
      await processStripeEvent(event, deps);
      assert.equal(
        (await db.query("SELECT stock_quantity FROM products")).rows[0]
          .stock_quantity,
        5,
      );
      assert.equal(
        (await checkoutStatus(session.id, deps)).payment_status,
        failed ? "FAILED" : "EXPIRED",
      );
      session.status = "complete";
      session.payment_status = "paid";
      await assert.rejects(
        processStripeEvent(eventFor(session), deps),
        /manual inventory reconciliation/,
      );
    }
  } finally {
    await db.close();
  }
});

test("HTTP verifies raw signatures and origin; database failures cause webhook retries", async () => {
  const db = await sandboxDatabase(),
    stripe = fakeStripe(),
    deps = { pool: db, stripe, config };
  try {
    const post = (body, origin = config.origin) =>
      new Request(`${config.origin}/api/checkout`, {
        method: "POST",
        headers: { origin, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    assert.equal(
      (
        await checkoutHandler(
          post(payload(), "https://attacker.example"),
          () => deps,
        )
      ).status,
      403,
    );
    const res = await checkoutHandler(post(payload()), () => deps);
    assert.equal(res.status, 200);
    const session = stripe.sessions.get((await res.json()).session_id);
    session.status = "complete";
    session.payment_status = "paid";
    const body = JSON.stringify(eventFor(session));
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: body,
      secret: config.webhookSecret,
    });
    const hook = (b, s) =>
      new Request(`${config.origin}/api/stripe-webhook`, {
        method: "POST",
        headers: { "stripe-signature": s },
        body: b,
      });
    assert.equal(
      (await webhookHandler(hook(body, "bad"), () => deps)).status,
      400,
    );
    assert.equal(
      (await webhookHandler(hook(body + " ", signature), () => deps)).status,
      400,
    );
    assert.equal(
      (await webhookHandler(hook(body, signature), () => deps)).status,
      200,
    );
    assert.equal(
      (await webhookHandler(hook(body, signature), () => deps)).status,
      200,
    );
    assert.equal(
      (await checkoutStatus(session.id, deps)).payment_status,
      "PAID",
    );
    const broken = {
      ...deps,
      pool: {
        query: async () => {
          throw Error("Database unavailable");
        },
      },
    };
    assert.equal(
      (await webhookHandler(hook(body, signature), () => broken)).status,
      503,
    );
  } finally {
    await db.close();
  }
});

test("browser idempotency survives reopening without storing personal details", async () => {
  const memory = new Map(),
    storage = {
      getItem: (k) => memory.get(k),
      setItem: (k, v) => memory.set(k, v),
    };
  const p = payload();
  const first = await checkoutRequestKey(p, storage);
  assert.equal(await checkoutRequestKey(p, storage), first);
  assert.notEqual(
    await checkoutRequestKey({ ...p, total: 75 }, storage),
    first,
  );
  assert.ok(![...memory.values()].join("").includes(p.customer_email));
});

test("payment return clears only its own unchanged cart and preserves other-tab changes", () => {
  const cart = [{ id: "tee", quantity: 2 }];
  for (const [session, persisted, expected] of [
    ["matching", cart, 1],
    ["older", cart, 0],
    ["matching", [...cart, { id: "new" }], 0],
  ]) {
    const data = new Map([
      ["gzn_checkout_session", "matching"],
      ["gzn_checkout_cart", JSON.stringify(JSON.stringify(cart))],
    ]);
    const storage = {
      getItem: (key) => data.get(key),
      removeItem: (key) => data.delete(key),
    };
    let cleared = 0;
    settleCheckoutCart(
      session,
      { cart, loadCart: () => persisted, clearCart: () => cleared++ },
      storage,
    );
    assert.equal(cleared, expected);
    if (session === "older")
      assert.equal(data.get("gzn_checkout_session"), "matching");
  }
});

test("lost Stripe response retries the same session and recovers a missed database attachment", async () => {
  const db = await sandboxDatabase(),
    stripe = fakeStripe(),
    deps = { pool: db, stripe, config };
  try {
    const create = stripe.checkout.sessions.create;
    let fail = true;
    stripe.checkout.sessions.create = async (...args) => {
      const session = await create(...args);
      if (fail) {
        fail = false;
        throw Error("Connection lost after creation");
      }
      return session;
    };
    const request = payload();
    await assert.rejects(createCheckout(request, deps), /Connection lost/);
    const result = await createCheckout(request, deps);
    assert.equal(stripe.sessions.size, 1);
    assert.equal(
      (await db.query("SELECT stock_quantity FROM products")).rows[0]
        .stock_quantity,
      3,
    );
    await db.query("UPDATE orders SET stripe_session_id=NULL");
    const session = stripe.sessions.get(result.session_id);
    session.status = "complete";
    session.payment_status = "paid";
    await processStripeEvent(eventFor(session), deps);
    assert.equal(
      (await checkoutStatus(session.id, deps)).payment_status,
      "PAID",
    );
  } finally {
    await db.close();
  }
});

test("orphan recovery cannot release a fresh reservation and restores stale stock once", async () => {
  const db = await sandboxDatabase();
  try {
    const [{ data: order }] = (
      await db.query("SELECT reserve_stripe_order($1) AS data", [
        JSON.stringify(normalizePayload(payload())),
      ])
    ).rows;
    await assert.rejects(
      db.query("SELECT release_orphan_stripe_order($1)", [order.id]),
      /not eligible/,
    );
    await db.query(
      "UPDATE orders SET created_at=now()-interval '3 hours' WHERE id=$1",
      [order.id],
    );
    await db.query("SELECT release_orphan_stripe_order($1)", [order.id]);
    await assert.rejects(
      db.query("SELECT release_orphan_stripe_order($1)", [order.id]),
      /not eligible/,
    );
    assert.equal(
      (await db.query("SELECT stock_quantity FROM products")).rows[0]
        .stock_quantity,
      5,
    );
  } finally {
    await db.close();
  }
});
