export const stripeCheckoutEnabled =
  import.meta.env?.VITE_STRIPE_PAYMENTS_ENABLED === "true";
const pendingKey = "gzn_pending_checkout";

export function restoreCheckoutPromo(store) {
  try {
    if (
      JSON.parse(sessionStorage.getItem("gzn_checkout_cart") || "null") ===
      JSON.stringify(store.cart)
    ) {
      const code = sessionStorage.getItem("gzn_checkout_promo");
      if (code) store.applyPromoCode(code);
    }
  } catch {
    /* A missing or corrupt snapshot must not prevent shopping. */
  }
}

export async function checkoutRequestKey(payload, storage = sessionStorage) {
  // Keep retries stable through a reload or reopening the review, without persisting PII.
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const fingerprint = Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  let previous;
  try {
    previous = JSON.parse(storage.getItem(pendingKey) || "null");
  } catch {
    previous = null;
  }
  if (previous?.fingerprint === fingerprint) return previous.key;
  const key = crypto.randomUUID();
  storage.setItem(pendingKey, JSON.stringify({ fingerprint, key }));
  storage.removeItem?.("gzn_checkout_session");
  return key;
}

export async function startStripeCheckout(payload) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      result.error || "Checkout is unavailable. Your bag is saved.",
    );
  if (result.session_id)
    sessionStorage.setItem("gzn_checkout_session", result.session_id);
  if (result.url) {
    const target = new URL(result.url);
    if (
      target.protocol !== "https:" ||
      target.hostname !== "checkout.stripe.com"
    )
      throw new Error("Invalid checkout redirect.");
    location.assign(target.href);
  } else if (result.session_id) {
    location.assign(
      `/?checkout=success&session_id=${encodeURIComponent(result.session_id)}`,
    );
  } else throw new Error("Checkout is unavailable. Your bag is saved.");
}

export function settleCheckoutCart(sessionId, store, storage = sessionStorage) {
  if (storage.getItem("gzn_checkout_session") !== sessionId) return;
  let submitted;
  try {
    submitted = JSON.parse(storage.getItem("gzn_checkout_cart") || "null");
  } catch {
    submitted = null;
  }
  if (
    submitted === JSON.stringify(store.cart) &&
    submitted === JSON.stringify(store.loadCart())
  )
    store.clearCart();
  for (const key of [
    pendingKey,
    "gzn_checkout_cart",
    "gzn_checkout_promo",
    "gzn_checkout_session",
  ])
    storage.removeItem(key);
}

export function showCheckoutReturn({ store, escapeHTML, openCart }) {
  const params = new URLSearchParams(location.search);
  if (!["success", "cancelled"].includes(params.get("checkout"))) return;
  const sessionId = params.get("session_id");
  const modal = document.getElementById("quick-view-modal");
  const content = document.getElementById("quick-view-content");
  content.innerHTML = `<button class="modal-close-btn" id="close-payment" aria-label="Close payment status">✕</button><div class="order-review"><p class="eyebrow">GZN SPORTS / SANDBOX CHECKOUT</p><h2 id="payment-title">CHECKING YOUR PAYMENT.</h2><p id="payment-status" role="status">Waiting for payment confirmation…</p><button class="action-button dark-button" id="payment-refresh">Check again</button><button class="action-button" id="payment-bag">Return to bag</button></div>`;
  modal.classList.add("open");
  document.getElementById("close-payment").onclick = () =>
    modal.classList.remove("open");
  document.getElementById("payment-bag").onclick = () => {
    modal.classList.remove("open");
    openCart();
  };
  const status = document.getElementById("payment-status");
  const title = document.getElementById("payment-title");
  const refresh = document.getElementById("payment-refresh");
  async function check() {
    refresh.disabled = true;
    try {
      const response = await fetch(
        `/api/checkout?session_id=${encodeURIComponent(sessionId || "")}`,
        { cache: "no-store" },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Payment status is not available yet.");
      if (result.payment_status === "PAID") {
        title.textContent = "TEST PAYMENT CONFIRMED.";
        status.innerHTML = `Reference ${escapeHTML(result.reference)}. This sandbox order will not be shipped.`;
        // Do not clear new items added in another tab while Checkout was open.
        settleCheckoutCart(sessionId, store);
        refresh.hidden = true;
      } else if (["EXPIRED", "FAILED"].includes(result.payment_status)) {
        title.textContent = "CHECKOUT ENDED.";
        status.textContent =
          "Payment was not completed. Your bag is saved; you can start a new checkout.";
        if (sessionStorage.getItem("gzn_checkout_session") === sessionId)
          sessionStorage.removeItem(pendingKey);
        refresh.hidden = true;
      } else {
        title.textContent =
          params.get("checkout") === "cancelled"
            ? "YOUR BAG IS SAVED."
            : "PAYMENT PENDING.";
        status.textContent =
          "Payment is not confirmed yet. Check again shortly. Returning from Stripe does not cancel an open session; you can resume it from your bag.";
      }
    } catch (error) {
      status.textContent =
        error.message || "Unable to check payment. Please try again.";
    } finally {
      refresh.disabled = false;
    }
  }
  refresh.onclick = check;
  void check();
}
