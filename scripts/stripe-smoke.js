import { loadEnvFile } from "node:process";
import { existsSync } from "node:fs";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { sandboxDatabase } from "./payment-fixture.js";
import {
  createCheckout,
  processStripeEvent,
  checkoutStatus,
} from "../server/payments.js";
if (existsSync(".env.local")) loadEnvFile(".env.local");
if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_"))
  throw Error("A sandbox secret key is required.");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  maxNetworkRetries: 2,
  timeout: 15000,
});
const pool = await sandboxDatabase();
const deps = { pool, stripe, config: { origin: "http://localhost:5173" } };
let sessionId;
try {
  const account = await stripe.accounts.retrieve();
  assert.equal(
    account.id,
    "acct_1U56z52VnC7RumS6",
    "Use the GZN Sports LLC sandbox account selected by the planner.",
  );
  const request = {
    request_key: crypto.randomUUID(),
    customer_name: "Sandbox Integration Test",
    customer_email: "sandbox-test@example.com",
    shipping_address: { address: "Synthetic test address — do not ship" },
    items: [{ id: "tee", size: "M", quantity: 2 }],
    promo_code: "CHAMPION10",
    total: 45,
  };
  const created = await createCheckout(request, deps);
  sessionId = created.session_id;
  assert.deepEqual(await createCheckout(request, deps), created);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  assert.equal(session.livemode, false);
  assert.equal(session.amount_total, 4500);
  assert.equal(session.currency, "usd");
  await stripe.checkout.sessions.expire(sessionId);
  await processStripeEvent(
    {
      id: `smoke_expired_${sessionId}`,
      type: "checkout.session.expired",
      livemode: false,
      data: { object: session },
    },
    deps,
  );
  assert.equal(
    (await checkoutStatus(sessionId, deps)).payment_status,
    "EXPIRED",
  );
  assert.equal(
    (await pool.query("SELECT stock_quantity FROM products")).rows[0]
      .stock_quantity,
    5,
  );
  console.log(
    "PASS: GZN Sports sandbox account; real Checkout Session creation, USD discount total, retry reuse, Stripe expiration and local inventory restoration. No payment submitted. Production database untouched.",
  );
} catch (error) {
  console.error(
    "Sandbox smoke test failed:",
    error.type || error.name,
    error.code || "",
    error instanceof assert.AssertionError
      ? error.message
      : "Check sandbox configuration and connectivity.",
  );
  process.exitCode = 1;
} finally {
  if (sessionId) {
    const latest = await stripe.checkout.sessions
      .retrieve(sessionId)
      .catch(() => null);
    if (latest?.status === "open")
      await stripe.checkout.sessions.expire(sessionId);
  }
  await pool.close();
}
