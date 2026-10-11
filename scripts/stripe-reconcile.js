// Run periodically against the separately configured sandbox database.
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { runtime, processStripeEvent } from "../server/payments.js";
if (existsSync(".env.local")) loadEnvFile(".env.local");
if (existsSync(".env.payments.local")) loadEnvFile(".env.payments.local");
const deps = runtime();
try {
  const { rows } = await deps.pool
    .query(`SELECT id,stripe_session_id,created_at FROM orders
    WHERE payment_provider='stripe_test' AND inventory_reserved AND payment_status<>'PAID'
    AND created_at<now()-interval '2 hours' ORDER BY created_at LIMIT 100`);
  for (const order of rows) {
    let sessionId = order.stripe_session_id;
    if (!sessionId) {
      const start = Math.floor(new Date(order.created_at).getTime() / 1000);
      const matches = [];
      // Exhaust pagination: partial results or Stripe outages must never release stock.
      for await (const s of deps.stripe.checkout.sessions.list({
        created: { gte: start - 60, lte: start + 7200 },
        limit: 100,
      }))
        if (
          s.metadata?.order_id === order.id &&
          s.metadata?.integration === "gzn_sandbox"
        )
          matches.push(s);
      if (matches.length > 1)
        throw Error("Multiple sessions need manual reconciliation.");
      if (matches.length === 0) {
        await deps.pool.query("SELECT release_orphan_stripe_order($1)", [
          order.id,
        ]);
        continue;
      }
      sessionId = matches[0].id;
      await deps.pool.query(
        "UPDATE orders SET stripe_session_id=$2 WHERE id=$1 AND stripe_session_id IS NULL",
        [order.id, sessionId],
      );
    }
    const session = await deps.stripe.checkout.sessions.retrieve(sessionId);
    let type =
      session.status === "expired"
        ? "checkout.session.expired"
        : "checkout.session.completed";
    if (
      session.status === "complete" &&
      session.payment_status === "unpaid" &&
      session.payment_intent
    ) {
      const intent = await deps.stripe.paymentIntents.retrieve(
        session.payment_intent,
      );
      if (["canceled", "requires_payment_method"].includes(intent.status))
        type = "checkout.session.async_payment_failed";
    }
    await processStripeEvent(
      {
        id: `reconcile_${session.id}_${session.status}_${session.payment_status}_${type}`,
        type,
        livemode: false,
        data: { object: session },
      },
      deps,
    );
  }
  console.log(`Reconciled ${rows.length} sandbox reservations.`);
} catch (error) {
  console.error(
    "Reconciliation failed; reservations retained for safe retry.",
    error.code || error.name,
  );
  process.exitCode = 1;
} finally {
  await deps.pool.end();
}
