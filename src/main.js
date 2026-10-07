import { CURRENT_DIRECTION, isApparel } from "./catalog.js";
import { SAMPLE_PRODUCTS } from "./sample-products.js";
import { initializeSamplePreview } from "./lib/draft-store.js";
import { validateSelection } from "./lib/commerce-validation.js";
import { applyContent } from "./site-content.js";
import { isDraft } from "./lib/draft-store.js";
import "./storefront.css";
import { PRODUCTS, store } from "./store.js";
import { toggleSound, playMetallicClick } from "./audio.js";
import { initAdminPanel, openAdminPanel } from "./admin.js";
import { initAuthModal, openAuthModal } from "./auth-modal.js";
import { initModals, openModal } from "./modals.js";
import { adminApi } from "./lib/admin-api.js";
import { realtimeEngine } from "./lib/realtime-engine.js";
import { auth } from "./lib/supabase.js";
import { storefront } from "./views/storefront.js";
import { cartMarkup } from "./views/cart.js";
import { escapeHTML as e, productCard, displayTitle } from "./ui.js";
import { initExperience } from "./experience.js";
import { coalesceRefresh, startRefreshLoop } from "./lib/refresh-loop.js";
import { startReleaseUpdates } from "./lib/release-updates.js";

let currentCategory = "all";
let currentSort = "featured";
const refreshCatalog = coalesceRefresh(() => syncCatalog(true));
const refreshSettings = coalesceRefresh(syncSettings);
const refreshStore = () => Promise.all([refreshCatalog(), refreshSettings()]);
let lastSettings = "";
document.addEventListener("DOMContentLoaded", () => {
  initializeSamplePreview(SAMPLE_PRODUCTS);
  if (!isDraft()) PRODUCTS.length = 0;
  document.getElementById("app").innerHTML = storefront() + cartMarkup;
  initModals();
  initAdminPanel();
  initAuthModal();
  renderProducts();
  updateCartUI();
  store.subscribe(() => {
    updateCartUI();
    renderProducts();
  });
  setupEvents();
  window.addEventListener("gnz:data-changed", () => {
    void refreshStore();
  });
  window.addEventListener("storage", () => {
    void refreshStore();
  });
  if (isDraft()) {
    const notice = document.createElement("div");
    notice.className = "draft-notice";
    notice.textContent =
      "SAMPLE STORE — Editable preview. Products and test orders stay in this browser.";
    document.body.prepend(notice);
  }
  if (location.hash === "#admin") void openAdminPanel();
  initExperience();
  // The complete local collection renders before optional network work.
  void refreshStore();
  const stopRefresh = startRefreshLoop(refreshStore);
  const stopReleaseUpdates = startReleaseUpdates();
  if (import.meta.hot) import.meta.hot.dispose(stopReleaseUpdates);
  if (import.meta.hot) import.meta.hot.dispose(stopRefresh);
  realtimeEngine.init();
  realtimeEngine.onProductChange(() => void refreshCatalog());
  realtimeEngine.onSettingsChange(() => void refreshSettings());
  realtimeEngine.onStatusChange((status) => {
    if (status === "CONNECTED") void refreshStore();
  });
});

function renderProducts() {
  const products =
    currentCategory === "all"
      ? [...PRODUCTS]
      : PRODUCTS.filter((p) => p.category === currentCategory);
  if (currentSort === "featured")
    products.sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
  if (currentSort !== "featured")
    products.sort((a, b) =>
      currentSort === "low" ? a.price - b.price : b.price - a.price,
    );
  document.getElementById("product-grid-container").innerHTML = products.length
    ? products.map((p) => productCard(p, (n) => store.formatPrice(n))).join("")
    : '<p class="empty-collection">No pieces in this collection yet. Explore another category.</p>';
  document.getElementById("collection-count").textContent =
    `${String(products.length).padStart(2, "0")} PIECES / CONSIDERED IN EVERY DETAIL`;
}
function filterCategory(category) {
  currentCategory = category;
  document.querySelectorAll(".filter-tab").forEach((button) => {
    const selected = button.dataset.cat === category;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  renderProducts();
}
function setupEvents() {
  document.getElementById("cart-promo-remove").onclick = () => {
    store.removePromoCode();
    document.getElementById("cart-promo-status").textContent =
      "Discount removed.";
  };
  document.addEventListener("click", (event) => {
    const category = event.target.closest("[data-category]");
    if (category) filterCategory(category.dataset.category);
    const filter = event.target.closest(".filter-tab");
    if (filter) filterCategory(filter.dataset.cat);
    const inspect = event.target.closest(".quick-inspect-trigger");
    if (inspect) openQuickView(inspect.dataset.id);
    const add = event.target.closest(".add-to-cart-trigger");
    if (add) {
      const size = add
        .closest(".gzn-product-card")
        .querySelector(".card-size-select").value;
      const result = store.addToCart(add.dataset.id, size);
      if (result === false)
        return showNotificationToast(
          "The requested quantity is not available.",
        );
      openCart();
      showNotificationToast("Added to your bag.");
    }
    const qty = event.target.closest("[data-quantity]");
    if (qty)
      store.updateQuantity(
        qty.dataset.id,
        qty.dataset.size,
        Number(qty.dataset.quantity),
      );
    const remove = event.target.closest("[data-remove]");
    if (remove) store.removeFromCart(remove.dataset.id, remove.dataset.size);
  });
  document
    .getElementById("catalog-sort")
    .addEventListener("change", (event) => {
      currentSort = event.target.value;
      renderProducts();
    });
  document
    .getElementById("currency-select")
    .addEventListener("change", (event) =>
      store.setCurrency(event.target.value),
    );
  document
    .getElementById("cart-toggle-btn")
    .addEventListener("click", openCart);
  document
    .getElementById("cart-close-btn")
    .addEventListener("click", closeCart);
  document.getElementById("cart-overlay").addEventListener("click", closeCart);
  document
    .getElementById("header-account-btn")
    .addEventListener("click", () => openAuthModal());
  document
    .getElementById("footer-account-btn")
    .addEventListener("click", () => openAuthModal());
  document
    .getElementById("header-admin-btn")
    .addEventListener("click", openAdminPanel);
  document.getElementById("audio-toggle-btn").addEventListener("click", () => {
    document.getElementById("audio-icon").textContent = toggleSound()
      ? "on"
      : "off";
  });
  document
    .getElementById("cart-promo-btn")
    .addEventListener("click", applyPromo);
  document
    .getElementById("cart-promo-input")
    .addEventListener("keydown", (event) => {
      if (event.key === "Enter") applyPromo();
    });
  document
    .getElementById("checkout-btn")
    .addEventListener("click", openOrderReview);
  document.querySelectorAll(".policy-link").forEach((link) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.getElementById("legal-modal-title").textContent =
        "STORE INFORMATION";
      openModal("legal-modal");
    }),
  );
}
function applyPromo() {
  const result = store.applyPromoCode(
    document.getElementById("cart-promo-input").value,
  );
  const status = document.getElementById("cart-promo-status");
  status.textContent = result.message;
  status.setAttribute("role", "status");
  status.classList.toggle("is-error", !result.success);
}
function updateCartUI() {
  document.getElementById("cart-promo-remove").hidden = !store.discountCode;
  document.getElementById("cart-counter-badge").textContent =
    store.getCartCount();
  document.getElementById("cart-subtotal-price").textContent =
    store.formatPrice(store.getCartSubtotal());
  document.getElementById("cart-total-price").textContent = store.formatPrice(
    store.getCartTotal(),
  );
  const discount = store.getCartDiscount();
  document.getElementById("cart-discount-row").style.display = discount
    ? "flex"
    : "none";
  document.getElementById("cart-discount-amount").textContent =
    `−${store.formatPrice(discount)}`;
  const shipping = store.getFreeShippingProgress();
  document.getElementById("shipping-meter-fill").style.width =
    `${shipping.percent}%`;
  document.getElementById("shipping-percent-text").textContent =
    `${shipping.percent}%`;
  document.getElementById("shipping-status-text").textContent =
    shipping.unlocked
      ? "FREE SHIPPING THRESHOLD REACHED"
      : `${store.formatPrice(shipping.remaining)} AWAY FROM FREE SHIPPING`;
  document.getElementById("checkout-btn").disabled = store.cart.length === 0;
  document.getElementById("cart-items-container").innerHTML = store.cart.length
    ? store.cart
        .map(
          (item) => `
    <div class="cart-item"><img src="${e(item.image)}" alt="${e(item.title)}" class="cart-item-img" /><div><h4 class="cart-item-title">${e(item.title)}</h4><p class="cart-item-size">${e(item.size)}</p><div class="cart-qty-ctrl"><button class="qty-btn" data-id="${e(item.id)}" data-size="${e(item.size)}" data-quantity="-1" aria-label="Decrease quantity of ${e(item.title)}">−</button><span>${item.quantity}</span><button class="qty-btn" data-id="${e(item.id)}" data-size="${e(item.size)}" data-quantity="1" aria-label="Increase quantity of ${e(item.title)}">+</button></div></div><div class="cart-item-end"><strong>${store.formatPrice(item.price * item.quantity)}</strong><button data-remove data-id="${e(item.id)}" data-size="${e(item.size)}" aria-label="Remove ${e(item.title)}">Remove</button></div></div>`,
        )
        .join("")
    : '<div class="bag-empty"><span>YOUR NEXT<br>STATEMENT.</span><p>Your bag is waiting. Discover your next piece.</p><a href="#armory" id="empty-shop">Explore the collection ↗</a></div>';
  document.getElementById("empty-shop")?.addEventListener("click", closeCart);
}
function openCart() {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
  playMetallicClick();
}
function closeCart() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
}
window.openQuickView = openQuickView;
function openQuickView(id) {
  const p = PRODUCTS.find((product) => product.id === id);
  if (!p) return;
  const modal = document.getElementById("quick-view-modal");
  document.getElementById("quick-view-content").innerHTML =
    `<button class="modal-close-btn" id="modal-close-trigger" aria-label="Close product details">✕</button><div class="quick-view-grid"><img class="quick-view-image" src="${e(p.image)}" alt="${e(p.title)}" /><div><p class="eyebrow">${e(p.category)} / GNZSPORTS</p><h2>${e(displayTitle(p))}</h2><p class="quick-price">${store.formatPrice(p.price)}</p><p class="quick-description">${e(p.description)}</p><dl class="quick-specs">${(p.specs || []).map((s) => `<div><dt>${e(s.label)}</dt><dd>${e(s.value)}</dd></div>`).join("")}</dl><label class="quick-size" for="quick-size">Choose your ${isApparel(p.category) ? "size" : "option"}</label><select id="quick-size">${p.sizes.map((s) => `<option ${s === p.defaultSize ? "selected" : ""} value="${e(s)}">${e(s)}</option>`).join("")}</select><button class="action-button dark-button" id="modal-add-btn" ${p.stock_quantity === 0 ? "disabled" : ""}>${p.stock_quantity === 0 ? "Sold out" : "Add to bag"} <span>+</span></button></div></div>`;
  modal.classList.add("open");
  document.getElementById("modal-close-trigger").onclick = () =>
    modal.classList.remove("open");
  document.getElementById("modal-add-btn").onclick = () => {
    if (
      store.addToCart(id, document.getElementById("quick-size").value) === false
    )
      return showNotificationToast("The requested quantity is not available.");
    modal.classList.remove("open");
    openCart();
  };
}
async function openOrderReview() {
  const requestKey = crypto.randomUUID();
  if (!store.cart.length) return;
  closeCart();
  const modal = document.getElementById("quick-view-modal");
  document.getElementById("quick-view-content").innerHTML =
    `<button class="modal-close-btn" id="close-order" aria-label="Close order review">✕</button><div class="order-review"><p class="eyebrow">GNZSPORTS / ORDER REQUEST</p><h2>MAKE IT YOURS.</h2><p>${isDraft() ? "LOCAL DRAFT: this creates a test order only in this browser. " : ""}Send your selection to the store for confirmation. No payment is collected. Shipping and availability will be confirmed before payment.</p><p class="quick-price">${store.getCartCount()} pieces · ${store.formatPrice(store.getCartTotal())}</p><form id="order-request-form"><label for="order-name">Full name</label><input id="order-name" name="name" autocomplete="name" required maxlength="120" /><label for="order-email">Email address</label><input id="order-email" name="email" type="email" autocomplete="email" required maxlength="254" /><label for="order-address">Shipping address</label><textarea id="order-address" name="address" autocomplete="street-address" rows="3" required maxlength="1000"></textarea><p id="order-feedback" role="status"></p><button class="action-button dark-button" type="submit">Send order request <span>↗</span></button></form></div>`;
  modal.classList.add("open");
  document
    .getElementById("order-email")
    .insertAdjacentHTML(
      "afterend",
      '<label for="order-phone">Phone number (optional)</label><input id="order-phone" name="phone" type="tel" autocomplete="tel" maxlength="50" />',
    );
  document.getElementById("close-order").onclick = () =>
    modal.classList.remove("open");
  auth
    .getUser()
    .then((user) => {
      const input = document.getElementById("order-email");
      if (input && user?.email) input.value = user.email;
    })
    .catch(() => {});
  document
    .getElementById("order-request-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = "Sending your request…";
      try {
        const latestProducts = await adminApi.fetchProducts(true);
        const selection = validateSelection(store.cart, latestProducts);
        if (
          selection.some(
            (item, index) => item.price !== store.cart[index].price,
          )
        ) {
          store.cart = selection;
          store.saveCart();
          throw new Error(
            "Prices changed. Close this review and review your updated bag before submitting.",
          );
        }
        const order = await adminApi.createOrder({
          request_key: requestKey,
          customer_name: form.elements.name.value.trim(),
          customer_email: form.elements.email.value.trim(),
          customer_phone: form.elements.phone.value.trim(),
          items: selection,
          promo_code: store.discountCode,
          subtotal: store.getCartSubtotal(),
          total: Number(store.getCartTotal().toFixed(2)),
          discount: store.getCartDiscount(),
          status: "PENDING",
          payment_status: "UNPAID",
          shipping_address: { address: form.elements.address.value.trim() },
        });
        store.clearCart();
        form.innerHTML = `<div class="order-success" role="status"><h3>REQUEST RECEIVED.</h3><p>Reference ${e(String(order.id).slice(0, 8).toUpperCase())}. Your order is pending confirmation. No payment has been taken.</p></div>`;
      } catch (error) {
        document.getElementById("order-feedback").textContent =
          error.message ||
          "We couldn’t send your request. Your bag has been saved. Please try again.";
        button.disabled = false;
        button.textContent = "Retry order request ↗";
        console.warn("Order request failed:", error.message);
      }
    });
}
async function syncCatalog(fresh = false) {
  try {
    const products = await adminApi.fetchProducts(fresh);
    if (Array.isArray(products)) store.setProducts(products);
  } catch {
    if (!PRODUCTS.length)
      document.getElementById("product-grid-container").innerHTML =
        '<p class="empty-collection" role="status">The catalog is temporarily unavailable. We’ll retry automatically. You can contact the store using the details below.</p>';
  }
}
async function syncSettings() {
  try {
    const settings = await adminApi.fetchSiteSettings(true);
    const signature = JSON.stringify(settings);
    if (signature === lastSettings) return;
    if (settings.page_content?._direction === CURRENT_DIRECTION)
      applyContent(settings.page_content);
    const hero = settings.hero_config;
    // Legacy campaign copy remains stored until the editor publishes this direction.
    if (hero?.visual_direction === CURRENT_DIRECTION) {
      const title = document.getElementById("hero-title");
      title.replaceChildren(
        document.createTextNode(hero.headline_top || "YOUR DAY."),
        document.createElement("br"),
      );
      const bottom = document.createElement("span");
      bottom.textContent = hero.headline_bottom || "YOUR WAY.";
      title.append(bottom);
      if (hero.subhead)
        document.querySelector(".hero-description").textContent = hero.subhead;
      if (hero.badge_primary)
        document.querySelector(".hero-topline > span").textContent =
          hero.badge_primary;
      if (hero.cta_primary_text)
        document.querySelector(
          ".hero-buttons .action-button",
        ).firstChild.textContent = hero.cta_primary_text + " ";
      if (hero.cta_secondary_text)
        document.querySelector(
          ".hero-buttons .text-link",
        ).firstChild.textContent = hero.cta_secondary_text + " ";
      if (hero.badge_secondary)
        document.querySelector(".hero-caption").textContent =
          hero.badge_secondary;
    }
    if (settings.announcements?.visual_direction === CURRENT_DIRECTION) {
      const announcement = settings.announcements;
      if (announcement.banner_text)
        document.querySelector(".announcement > span:first-child").textContent =
          announcement.banner_text;
      if (announcement.shipping_text)
        document.querySelector(".announcement > span:last-child").textContent =
          announcement.shipping_text;
    }
    if (Number(settings.announcements?.shipping_threshold) > 0) {
      store.shippingThreshold = Number(
        settings.announcements.shipping_threshold,
      );
      updateCartUI();
    }
    lastSettings = signature;
  } catch {
    /* Campaign defaults remain available. */
  }
}
export function showNotificationToast(message) {
  let container = document.getElementById("gzn-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "gzn-toast-container";
    container.className = "gzn-toast-container";
    container.setAttribute("role", "status");
    document.body.append(container);
  }
  const toast = document.createElement("div");
  toast.className = "gzn-toast show";
  toast.textContent = message;
  container.append(toast);
  setTimeout(() => toast.remove(), 3500);
}
