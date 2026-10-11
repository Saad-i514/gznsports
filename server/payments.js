import Stripe from "stripe";
import { Pool } from "pg";
import { correctBranding } from '../src/lib/branding.js';

export class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function paymentConfig(env = process.env) {
  if (
    env.STRIPE_PAYMENTS_ENABLED !== "true" ||
    !/^sk_test_/.test(env.STRIPE_SECRET_KEY || "") ||
    !env.STRIPE_DATABASE_URL ||
    env.STRIPE_SANDBOX_DATABASE_CONFIRMED !== "true" ||
    !env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")
  ) {
    throw new CheckoutError(
      "Sandbox checkout is not configured yet. Your bag is saved.",
      503,
    );
  }
  const origin = new URL(env.SITE_URL).origin;
  const database = new URL(env.STRIPE_DATABASE_URL);
  // This release is sandbox-only: explicitly exclude the existing production project.
  if (
    `${database.hostname} ${decodeURIComponent(database.username)}`.includes(
      "xoizeqnphqtjjyodcfwk",
    )
  )
    throw new CheckoutError(
      "Use a separate sandbox database for test payments.",
      503,
    );
  if (
    !origin.startsWith("https://") &&
    !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  )
    throw new CheckoutError("Invalid checkout origin.", 503);
  return {
    origin,
    secret: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    databaseUrl: env.STRIPE_DATABASE_URL,
    ca: env.STRIPE_DATABASE_CA,
  };
}

let dependencies;
export function runtime() {
  const config = paymentConfig();
  if (!dependencies) {
    const local = ["localhost", "127.0.0.1"].includes(
      new URL(config.databaseUrl).hostname,
    );
    const url = new URL(config.databaseUrl);
    // pg connection-string SSL parameters must not override certificate verification.
    for (const name of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
      url.searchParams.delete(name);
    const pool = new Pool({
      connectionString: url.href,
      max: 3,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 10000,
      ssl: local
        ? false
        : { rejectUnauthorized: true, ...(config.ca ? { ca: config.ca } : {}) },
    });
    const stripe = new Stripe(config.secret, {
      maxNetworkRetries: 2,
      timeout: 15000,
    });
    dependencies = { pool, stripe, config };
  }
  return dependencies;
}

export function normalizePayload(input) {
  if (
    !input ||
    typeof input !== "object" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      input.request_key || "",
    )
  )
    throw new CheckoutError(
      "Invalid checkout request. Reopen your order review.",
    );
  for (const [value, max] of [
    [input.customer_name, 120],
    [input.customer_email, 254],
    [input.shipping_address?.address, 1000],
  ])
    if (typeof value !== "string" || !value.trim() || value.length > max)
      throw new CheckoutError("Provide your name, email and shipping address.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customer_email))
    throw new CheckoutError("Provide a valid email.");
  if (
    !Array.isArray(input.items) ||
    input.items.length < 1 ||
    input.items.length > 50 ||
    input.items.some(
      (i) =>
        !i ||
        typeof i.id !== "string" ||
        i.id.length > 200 ||
        typeof i.size !== "string" ||
        i.size.length > 60 ||
        !Number.isInteger(i.quantity) ||
        i.quantity < 1 ||
        i.quantity > 99,
    )
  )
    throw new CheckoutError("Choose valid items, sizes and quantities.");
  if (
    typeof input.total !== "number" ||
    !Number.isFinite(input.total) ||
    input.total < 0.5 ||
    input.total > 999999.99
  )
    throw new CheckoutError(
      "Checkout requires a total between $0.50 and $999,999.99 after discounts.",
    );
  return {
    request_key: input.request_key,
    customer_name: input.customer_name.trim(),
    customer_email: input.customer_email.trim().toLowerCase(),
    customer_phone: String(input.customer_phone || "").slice(0, 50),
    shipping_address: { address: input.shipping_address.address.trim() },
    items: input.items.map(({ id, size, quantity }) => ({
      id,
      size,
      quantity,
    })),
    promo_code: String(input.promo_code || "")
      .trim()
      .toUpperCase(),
    total: input.total,
  };
}

export function checkoutParams(order, origin) {
  const subtotal = Math.round(Number(order.subtotal) * 100);
  const discount = Math.round(Number(order.discount) * 100);
  let cumulative = 0,
    allocated = 0;
  const line_items = order.items.flatMap((item) => {
    const gross = Math.round(Number(item.price) * 100) * item.quantity;
    cumulative += gross;
    const target = Math.round((discount * cumulative) / subtotal);
    const net = gross - (target - allocated);
    allocated = target;
    const base = Math.floor(net / item.quantity),
      extra = net % item.quantity;
    return [
      [base, item.quantity - extra],
      [base + 1, extra],
    ]
      .filter(([, qty]) => qty > 0)
      .map(([amount, qty]) => ({
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: `${correctBranding(item.title)} — ${item.size}`,
            ...(discount
              ? { description: "Store discount included in this price." }
              : {}),
          },
        },
        quantity: qty,
      }));
  });
  return {
    mode: "payment",
    line_items,
    customer_email: order.customer_email,
    client_reference_id: order.id,
    metadata: { order_id: order.id, integration: "gzn_sandbox" },
    payment_intent_data: {
      metadata: { order_id: order.id, integration: "gzn_sandbox" },
    },
    adaptive_pricing: { enabled: false },
    expires_at: Math.floor(new Date(order.created_at).getTime() / 1000) + 3600,
    success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?checkout=cancelled&session_id={CHECKOUT_SESSION_ID}`,
  };
}

async function query(pool, sql, values) {
  return (await pool.query(sql, values)).rows;
}

export async function createCheckout(input, { pool, stripe, config }) {
  const payload = normalizePayload(input);
  let order;
  try {
    [order] = await query(
      pool,
      "SELECT reserve_stripe_order($1::jsonb) AS data",
      [JSON.stringify(payload)],
    );
    order = order.data;
  } catch (error) {
    if (error.code === "P0001") throw new CheckoutError(error.message);
    throw error;
  }
  if (
    ["EXPIRED", "FAILED"].includes(order.payment_status) ||
    order.status === "CANCELLED"
  )
    throw new CheckoutError(
      "This checkout has ended. Start a new order review.",
      409,
    );
  if (order.stripe_session_id) {
    const existing = await stripe.checkout.sessions.retrieve(
      order.stripe_session_id,
    );
    if (existing.status !== "open")
      return { session_id: existing.id, status: existing.status };
    return { url: existing.url, session_id: existing.id };
  }
  // A persisted payload keeps Stripe idempotency identical across retries and deployments.
  const [saved] = await query(
    pool,
    `UPDATE orders SET stripe_params=coalesce(stripe_params,$2::jsonb)
    WHERE id=$1 RETURNING stripe_params`,
    [order.id, JSON.stringify(checkoutParams(order, config.origin))],
  );
  if (Date.now() > new Date(order.created_at).getTime() + 25 * 60 * 1000)
    throw new CheckoutError(
      "Checkout recovery is required. Contact the store before trying another order.",
      409,
    );
  const session = await stripe.checkout.sessions.create(saved.stripe_params, {
    idempotencyKey: `gzn-checkout-${order.id}`,
  });
  if (session.livemode) throw new Error("Unexpected live Stripe session");
  await query(
    pool,
    "UPDATE orders SET stripe_session_id=$2 WHERE id=$1 AND (stripe_session_id IS NULL OR stripe_session_id=$2)",
    [order.id, session.id],
  );
  return { url: session.url, session_id: session.id };
}

const supportedEvents = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
]);
export async function processStripeEvent(event, { pool, stripe }) {
  if (event.livemode || !supportedEvents.has(event.type)) return;
  const snapshot = event.data.object;
  if (snapshot.metadata?.integration !== "gzn_sandbox") return;
  // Fetch current state so delayed/reordered events cannot regress a successful payment.
  const session = await stripe.checkout.sessions.retrieve(snapshot.id);
  // Handles a webhook arriving after Stripe created the session but before its ID was saved.
  await query(
    pool,
    `UPDATE orders SET stripe_session_id=$2 WHERE id=$1 AND payment_provider='stripe_test'
    AND stripe_session_id IS NULL AND stripe_params IS NOT NULL`,
    [session.metadata.order_id, session.id],
  );
  await query(pool, "SELECT apply_stripe_session($1::jsonb,$2,$3)", [
    JSON.stringify(session),
    event.id,
    event.type,
  ]);
}

export async function checkoutStatus(sessionId, { pool }) {
  if (!/^cs_test_[A-Za-z0-9_]{10,240}$/.test(sessionId || ""))
    throw new CheckoutError("Invalid checkout reference.");
  const [order] = await query(
    pool,
    `SELECT id,payment_status,status FROM orders
    WHERE stripe_session_id=$1 AND payment_provider='stripe_test'`,
    [sessionId],
  );
  if (!order)
    throw new CheckoutError(
      "Checkout confirmation is not available yet. Please retry.",
      404,
    );
  // The unguessable session ID is a bearer token. Never expose customer details here.
  return {
    reference: order.id.slice(0, 8).toUpperCase(),
    payment_status: order.payment_status,
  };
}
