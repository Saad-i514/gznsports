import {
  CheckoutError,
  runtime,
  createCheckout,
  checkoutStatus,
  processStripeEvent,
} from "./payments.js";

export const json = (value, status = 200) =>
  Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
export async function readBody(request, max = 64000) {
  if (Number(request.headers.get("content-length")) > max)
    throw new CheckoutError("Request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      throw new CheckoutError("Request is too large.", 413);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
function failure(error) {
  if (error instanceof CheckoutError)
    return json({ error: error.message }, error.status);
  // No request bodies, credentials, connection strings, or raw Stripe errors in logs/responses.
  console.error("Payment operation failed", {
    type: error.type || error.name,
    code: error.code || "unknown",
  });
  return json(
    {
      error:
        "Checkout is temporarily unavailable. Your bag is saved; retry with the same order.",
    },
    503,
  );
}
export async function checkoutHandler(request, getRuntime = runtime) {
  try {
    const deps = getRuntime();
    if (request.method === "GET")
      return json(
        await checkoutStatus(
          new URL(request.url).searchParams.get("session_id"),
          deps,
        ),
      );
    if (request.method !== "POST")
      return json({ error: "Method not allowed." }, 405);
    if (request.headers.get("origin") !== deps.config.origin)
      throw new CheckoutError("Invalid checkout origin.", 403);
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      throw new CheckoutError("Use a JSON request.", 415);
    let payload;
    try {
      payload = JSON.parse((await readBody(request)).toString("utf8"));
    } catch (error) {
      if (error instanceof CheckoutError) throw error;
      throw new CheckoutError("Invalid JSON.");
    }
    return json(await createCheckout(payload, deps));
  } catch (error) {
    return failure(error);
  }
}
export async function webhookHandler(request, getRuntime = runtime) {
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  try {
    const deps = getRuntime();
    const raw = await readBody(request, 1000000);
    let event;
    try {
      event = deps.stripe.webhooks.constructEvent(
        raw,
        request.headers.get("stripe-signature"),
        deps.config.webhookSecret,
      );
    } catch {
      return json({ error: "Invalid webhook signature." }, 400);
    }
    await processStripeEvent(event, deps);
    return json({ received: true });
  } catch (error) {
    return failure(error);
  }
}
