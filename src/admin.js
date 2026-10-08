import { CATEGORIES, CURRENT_DIRECTION } from "./catalog.js";
import { contentEditor, contentFields, validImage } from "./site-content.js";
import { isAdminUser } from "./lib/admin-access.js";
import { auth, supabase } from "./lib/supabase.js";
import {
  supportsDraft,
  isDraft,
  enableDraft,
  exitDraft,
} from "./lib/draft-store.js";
import { PRODUCTS } from "./store.js";
// GZNSPORTS // MASTER ADMINISTRATIVE COMMAND CONSOLE
import { adminApi } from "./lib/admin-api.js";
import { realtimeEngine } from "./lib/realtime-engine.js";
import { escapeHTML } from "./ui.js";
import { playMetallicClick, playPunchImpact } from "./audio.js";
import { openPasswordRecovery } from "./password-recovery.js";
import { nextOrderStatuses } from "./lib/order-rules.js";
import { initSizePicker } from './admin-sizes.js';

let isAdminOpen = false;
let privateOrdersChannel = null;
let currentTab = "overview";
let cachedProducts = [];
let cachedOrders = [];
let cachedSettings = {};

export function initAdminPanel() {
  renderAdminContainer();
  attachAdminTriggers();
  subscribeToRealtime();
  auth.onAuthStateChange((_event, session) => {
    if (isAdminOpen && !isDraft() && !isAdminUser(session?.user)) {
      if (privateOrdersChannel) {
        void supabase.removeChannel(privateOrdersChannel);
        privateOrdersChannel = null;
      }
      renderAdminGate();
    }
  });
}

function renderAdminContainer() {
  let container = document.getElementById("gzn-admin-overlay");
  if (!container) {
    container = document.createElement("div");
    container.id = "gzn-admin-overlay";
    container.className = "admin-overlay";
    document.body.appendChild(container);
  }
}

export async function openAdminPanel() {
  isAdminOpen = true;
  playMetallicClick();
  const overlay = document.getElementById("gzn-admin-overlay");
  if (overlay) {
    overlay.classList.add("open");
    if (isDraft()) return renderAdminUI();
    overlay.innerHTML =
      '<div class="admin-modal"><p>Checking administrator access…</p></div>';
    try {
      if (isAdminUser(await auth.getUser())) return renderAdminUI();
    } catch {}
    renderAdminGate();
  }
}

function renderAdminGate() {
  const overlay = document.getElementById("gzn-admin-overlay");
  overlay.innerHTML = `<div class="admin-modal admin-login"><button class="admin-close-btn" id="admin-gate-close" aria-label="Close admin sign in">✕</button><p class="eyebrow">GNZSPORTS / STORE MANAGEMENT</p><h2>YOUR STORE. YOUR CONTROL.</h2><p>Sign in with your administrator account to manage live products, website content and orders.</p><form id="admin-login-form" class="admin-form-grid"><div class="form-group full-width"><label for="admin-email">Email</label><input id="admin-email" value="gulraizbutt297@gmail.com" type="email" autocomplete="username" required /></div><div class="form-group full-width"><label for="admin-password">Password</label><input id="admin-password" type="password" autocomplete="current-password" required /></div><p id="admin-gate-feedback" role="status"></p><button class="btn-primary" type="submit">Sign in to live admin</button></form>${supportsDraft() ? '<hr><h3>Try the editor locally</h3><p>Changes persist in this browser only. No live products, settings or orders are modified.</p><button id="start-draft" class="btn-secondary">Open local draft editor</button>' : ""}</div>`;
  document.getElementById("admin-gate-close").onclick = closeAdminPanel;
  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "btn-secondary";
  reset.textContent = "Forgot password?";
  reset.onclick = () => {
    closeAdminPanel();
    openPasswordRecovery(false, document.getElementById("admin-email").value);
  };
  document.getElementById("admin-login-form").append(reset);
  document.getElementById("admin-login-form").onsubmit = async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button");
    button.disabled = true;
    try {
      const { user } = await auth.signIn(
        document.getElementById("admin-email").value.trim(),
        document.getElementById("admin-password").value,
      );
      if (!isAdminUser(user))
        throw new Error(
          "This account has no administrator role. Ask the project owner to grant admin access.",
        );
      renderAdminUI();
    } catch (error) {
      document.getElementById("admin-gate-feedback").textContent =
        error.message;
    } finally {
      button.disabled = false;
    }
  };
  document
    .getElementById("start-draft")
    ?.addEventListener("click", async (event) => {
      event.currentTarget.disabled = true;
      try {
        let settings = {};
        try {
          settings = await adminApi.fetchSiteSettings(true);
        } catch {}
        enableDraft(structuredClone(PRODUCTS), settings);
        location.hash = "admin";
        location.reload();
      } catch (error) {
        document.getElementById("admin-gate-feedback").textContent =
          error.message;
        event.target.disabled = false;
      }
    });
}

export function closeAdminPanel() {
  isAdminOpen = false;
  if (privateOrdersChannel) {
    void supabase.removeChannel(privateOrdersChannel);
    privateOrdersChannel = null;
  }
  playMetallicClick();
  const overlay = document.getElementById("gzn-admin-overlay");
  if (overlay) {
    overlay.classList.remove("open");
  }
}

function attachAdminTriggers() {
  window.addEventListener("gnz:close-admin", closeAdminPanel);
}

function subscribeToRealtime() {
  // Realtime must never replace an editor containing unsaved input.
  const editing = () =>
    !!document.querySelector("#product-editor-modal.open") ||
    !!document.querySelector('#gzn-admin-overlay form[data-dirty="true"]');
  document
    .getElementById("gzn-admin-overlay")
    .addEventListener("input", (event) => {
      const form = event.target.closest("form");
      if (form) form.dataset.dirty = "true";
    });
  realtimeEngine.init();

  realtimeEngine.onStatusChange((status) => {
    const pulseEl = document.getElementById("admin-realtime-status");
    if (pulseEl) {
      pulseEl.className = `admin-status-badge ${status.toLowerCase()}`;
      pulseEl.innerHTML = `<span class="pulse-dot"></span> REALTIME: ${status}`;
    }
  });

  realtimeEngine.onProductChange(() => {
    if (isAdminOpen && currentTab === "products" && !editing()) {
      loadProductsTab();
    }
  });

  realtimeEngine.onSettingsChange(() => {
    if (isAdminOpen && currentTab === "settings" && !editing()) {
      loadSettingsTab();
    }
  });

  realtimeEngine.onOrderChange(() => {
    if (isAdminOpen && (currentTab === "orders" || currentTab === "overview")) {
      if (currentTab === "orders") loadOrdersTab();
      else loadOverviewTab();
    }
  });
}

async function renderAdminUI() {
  const overlay = document.getElementById("gzn-admin-overlay");
  if (!overlay) return;

  if (!isDraft() && !privateOrdersChannel) {
    privateOrdersChannel = supabase
      .channel("gnz-admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          if (isAdminOpen && currentTab === "orders") void loadOrdersTab();
          if (isAdminOpen && currentTab === "overview") void loadOverviewTab();
        },
      )
      .subscribe();
  }
  const status = realtimeEngine.getStatus();

  overlay.innerHTML = `
    <div class="admin-modal">
      <!-- HEADER -->
      <div class="admin-header">
        <div class="admin-header-title">
          <div class="admin-brand">
            <span class="mono-tag" style="background:#f1f5f9; color:#b45309; border:1px solid #e2e8f0; font-weight:700;">[ GNZSPORTS STORE EXECUTIVE ]</span>
            <h2>EXECUTIVE STORE MANAGER</h2>
          </div>
          <div id="admin-realtime-status" class="admin-status-badge ${status.toLowerCase()}">
            <span class="pulse-dot"></span> REALTIME: ${status}
          </div>
        </div>
        <button class="admin-close-btn" id="admin-close-btn" title="Close Store Manager">✕</button>
      </div>

      <div class="admin-mode-bar"><span>${isDraft() ? "LOCAL DRAFT · Saved in this browser only" : "LIVE STORE · Changes publish to your website"}</span><button id="admin-exit-mode" class="btn-secondary">${isDraft() ? "Exit local draft" : "Sign out"}</button></div>
      <!-- NAVIGATION TABS -->
      <div class="admin-nav-tabs">
        <button class="admin-tab-btn ${currentTab === "overview" ? "active" : ""}" data-tab="overview">
          📊 STORE OVERVIEW
        </button>
        <button class="admin-tab-btn ${currentTab === "products" ? "active" : ""}" data-tab="products">
          🏆 PRODUCTS & COLLECTIONS
        </button>
        <button class="admin-tab-btn ${currentTab === "settings" ? "active" : ""}" data-tab="settings">
          ⚙️ STOREFRONT & HERO EDITOR
        </button>
        <button class="admin-tab-btn ${currentTab === "orders" ? "active" : ""}" data-tab="orders">
          📦 CUSTOMER ORDERS
        </button>
      </div>

      <!-- MAIN TAB CONTENT AREA -->
      <div class="admin-content-area" id="admin-tab-content">
        <div class="admin-loading-spinner">
          <span class="spinner-ring"></span>
          <span>CONNECTING TO STORE DATABASE...</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById("admin-exit-mode").onclick = async () => {
    if (isDraft()) return exitDraft();
    try {
      await auth.signOut();
      closeAdminPanel();
    } catch (error) {
      alert(error.message);
    }
  };
  // Attach Header Events
  document
    .getElementById("admin-close-btn")
    ?.addEventListener("click", closeAdminPanel);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeAdminPanel();
  });

  // Tab switching
  overlay.querySelectorAll(".admin-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      overlay
        .querySelectorAll(".admin-tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentTab = btn.getAttribute("data-tab");
      playMetallicClick();
      loadTabContent();
    });
  });

  loadTabContent();
}

function loadTabContent() {
  if (currentTab === "overview") loadOverviewTab();
  else if (currentTab === "products") loadProductsTab();
  else if (currentTab === "settings") loadSettingsTab();
  else if (currentTab === "orders") loadOrdersTab();
}

// -------------------------------------------------------------
// TAB 1: TELEMETRY & OVERVIEW
// -------------------------------------------------------------
async function loadOverviewTab() {
  const content = document.getElementById("admin-tab-content");
  if (!content) return;

  try {
    const metrics = await adminApi.getDashboardMetrics();
    content.innerHTML = `
      <div class="admin-metrics-grid">
        <div class="metric-box">
          <div class="metric-top">
            <span class="mono-tag" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a;">TOTAL REVENUE</span>
            <span class="metric-icon">💰</span>
          </div>
          <div class="metric-big-number">$${metrics.totalRevenue.toFixed(2)}</div>
          <span class="metric-sub">Paid, non-cancelled orders</span>
        </div>

        <div class="metric-box">
          <div class="metric-top">
            <span class="mono-tag" style="background:#eff6ff; color:#1d4ed8; border:1px solid #dbeafe;">TOTAL ORDERS</span>
            <span class="metric-icon">📦</span>
          </div>
          <div class="metric-big-number">${metrics.totalOrders}</div>
          <span class="metric-sub">Order requests received</span>
        </div>

        <div class="metric-box">
          <div class="metric-top">
            <span class="mono-tag" style="background:#f1f5f9; color:#475569; border:1px solid #e2e8f0;">CATALOG INVENTORY</span>
            <span class="metric-icon">🏆</span>
          </div>
          <div class="metric-big-number">${metrics.totalProducts}</div>
          <span class="metric-sub">Products in current workspace</span>
        </div>

        <div class="metric-box">
          <div class="metric-top">
            <span class="mono-tag" style="background:#fff7ed; color:#c2410c; border:1px solid #ffedd5;">LOW STOCK ALERT</span>
            <span class="metric-icon">⚠️</span>
          </div>
          <div class="metric-big-number" style="color: ${metrics.lowStockCount > 0 ? "#ef4444" : "#0f172a"};">
            ${metrics.lowStockCount}
          </div>
          <span class="metric-sub">Items below 30 units threshold</span>
        </div>
      </div>

      <div class="admin-section-block">
        <div class="admin-section-header">
          <h3>RECENT CUSTOMER ORDERS</h3>
          <button class="btn-secondary" style="font-size: 0.72rem; padding: 0.4rem 0.8rem;" id="refresh-overview-btn">
            🔄 REFRESH METRICS
          </button>
        </div>

        ${
          metrics.recentOrders.length === 0
            ? `
          <div class="admin-empty-state">No orders registered in the system yet. Order requests appear here.</div>
        `
            : `
          <table class="admin-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              ${metrics.recentOrders
                .map(
                  (o) => `
                <tr>
                  <td class="mono-tag">${o.id.substring(0, 8)}...</td>
                  <td><strong>${escapeHTML(o.customer_name)}</strong><br><span style="font-size:0.75rem; color:#888;">${escapeHTML(o.customer_email)}</span></td>
                  <td style="font-family:var(--font-mono); font-weight:700;">$${parseFloat(o.total).toFixed(2)}</td>
                  <td><span class="status-pill status-${(o.status || "pending").toLowerCase()}">${o.status}</span></td>
                  <td class="mono-tag">${new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        `
        }
      </div>
    `;

    document
      .getElementById("refresh-overview-btn")
      ?.addEventListener("click", () => {
        playMetallicClick();
        loadOverviewTab();
      });
  } catch (err) {
    content.innerHTML = `<div class="admin-error">Failed to load telemetry: ${escapeHTML(err.message)}</div>`;
  }
}

// -------------------------------------------------------------
// TAB 2: PRODUCT ARMORY (CRUD)
// -------------------------------------------------------------
async function loadProductsTab() {
  const content = document.getElementById("admin-tab-content");
  if (!content) return;

  try {
    cachedProducts = await adminApi.fetchProducts(true);

    content.innerHTML = `
      <div class="admin-section-header">
        <div>
          <h3>PRODUCT CATALOG</h3>
          <p style="color:var(--gzn-slate); font-size:0.85rem;">Create, edit pricing, manage stock levels, and save products to the current workspace.</p>
        </div>
        <button class="btn-primary" id="open-add-product-btn" style="padding:0.6rem 1.2rem; font-size:0.8rem;">
          + ADD NEW PRODUCT
        </button>
      </div>

      <div class="admin-products-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>IMAGE</th>
              <th>PRODUCT TITLE</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>STOCK</th>
              <th>TAG</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            ${cachedProducts
              .map(
                (p) => `
              <tr data-id="${escapeHTML(p.id)}">
                <td>
                  <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title)}" style="width:48px; height:48px; object-fit:cover; border-radius:6px; border:1px solid #e2e8f0;" />
                </td>
                <td>
                  <strong>${escapeHTML(p.title)}</strong>
                  <div style="font-size:0.75rem; color:var(--gzn-slate); max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    ${escapeHTML(p.description || "")}
                  </div>
                </td>
                <td><span class="mono-tag" style="background:#f1f5f9; color:#475569; border:1px solid #e2e8f0;">${p.category.toUpperCase()}</span></td>
                <td style="font-family:var(--font-mono); font-weight:700; color:#b45309; font-size:1.05rem;">
                  $${parseFloat(p.price).toFixed(2)}
                </td>
                <td>
                  <div class="stock-counter-wrap">
                    <button class="stock-btn stock-down" data-id="${escapeHTML(p.id)}">-</button>
                    <span class="stock-val mono-tag ${p.stock_quantity < 30 ? "low" : ""}">${p.stock_quantity || 0}</span>
                    <button class="stock-btn stock-up" data-id="${escapeHTML(p.id)}">+</button>
                  </div>
                </td>
                <td><span class="card-tag-badge" style="position:static; font-size:0.65rem;">${escapeHTML(p.tag || "STANDARD")}</span></td>
                <td>
                  <div style="display:flex; gap:0.4rem;">
                    <button class="admin-icon-btn edit-product-trigger" data-id="${escapeHTML(p.id)}" title="Edit Product">✏️</button>
                    <button class="admin-icon-btn delete-product-trigger" data-id="${escapeHTML(p.id)}" title="Delete Product" style="color:#ef4444;">🗑️</button>
                  </div>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <!-- SUB-MODAL FOR CREATE / EDIT PRODUCT -->
      <div id="product-editor-modal" class="admin-sub-modal">
        <div class="admin-sub-modal-content">
          <div class="admin-sub-header">
            <h4 id="product-editor-title">ADD NEW PRODUCT SPECIFICATION</h4>
            <button class="admin-close-btn" id="close-product-editor">✕</button>
          </div>
          <form id="product-editor-form" class="admin-form-grid">
            <input type="hidden" id="edit-product-id" />
            
            <div class="form-group full-width">
              <label>PRODUCT TITLE</label>
              <input type="text" id="edit-product-title" placeholder="e.g. GNZSPORTS Core Cotton Tee" required />
            </div>

            <div class="form-group">
              <label>CATEGORY</label>
              <select id="edit-product-category">
                ${CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
              </select>
            </div>

            <div class="form-group">
              <label>PRICE (USD $)</label>
              <input type="number" id="edit-product-price" step="0.01" min="0" placeholder="185.00" required />
            </div>

            <div class="form-group">
              <label>BADGE TAG</label>
              <input type="text" id="edit-product-tag" placeholder="EVERYDAY ESSENTIAL" />
            </div>

            <div class="form-group">
              <label>STOCK QUANTITY</label>
              <input type="number" id="edit-product-stock" min="0" value="50" required />
            </div>

            <div class="form-group full-width">
              <label>IMAGE URL / PATH</label>
              <input type="text" id="edit-product-image" placeholder="/images/samples/tshirts.svg or URL" required />
              <label for="edit-product-upload">UPLOAD PHOTO (LIVE MODE, MAX 5 MB)</label>
              <input type="file" id="edit-product-upload" accept="image/jpeg,image/png,image/webp" ${isDraft() ? "disabled" : ""} />
              <small id="upload-feedback" role="status">${isDraft() ? "Use an image URL or local path in draft mode." : "Uploaded photos are publicly visible."}</small>
            </div>

            <div class="form-group full-width" id="admin-size-picker">
              <label for="edit-product-sizes">AVAILABLE SIZES</label>
              <select id="edit-product-sizes" aria-describedby="admin-sizes-help"></select>
              <div class="admin-size-chips" aria-label="Selected sizes"></div>
              <small id="admin-sizes-help" role="status"></small>
            </div>

            <div class="form-group full-width">
              <label>PRODUCT DESCRIPTION</label>
              <textarea id="edit-product-desc" rows="3" placeholder="Engineered for champions..."></textarea>
            </div>

            <div class="form-group full-width"><label for="edit-product-specs">SPECIFICATIONS (one Label: Value per line)</label><textarea id="edit-product-specs" rows="4" placeholder="Color: Black&#10;Material: Cotton jersey&#10;Fit: Regular&#10;Care: Machine wash cold"></textarea></div>
            <div class="form-group"><label for="edit-product-featured">FEATURED PRODUCT</label><input id="edit-product-featured" type="checkbox" /></div>
            <div class="form-actions full-width">
              <button type="button" class="btn-secondary" id="cancel-product-edit">CANCEL</button>
              <button type="submit" class="btn-primary" id="save-product-submit">SAVE & PUBLISH TO STORE</button>
            </div>
          </form>
        </div>
      </div>
    `;

    content.querySelectorAll(".form-group").forEach((group) => {
      const input = group.querySelector("input,select,textarea");
      const label = group.querySelector("label");
      if (input && label) label.htmlFor = input.id;
    });
    attachProductEvents();
  } catch (err) {
    content.innerHTML = `<div class="admin-error">Failed to load product armory: ${escapeHTML(err.message)}</div>`;
  }
}

function attachProductEvents() {
  const editorModal = document.getElementById("product-editor-modal");
  const form = document.getElementById("product-editor-form");
  const sizes = initSizePicker(document.getElementById('admin-size-picker'));
  document.getElementById("edit-product-upload").onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const button = document.getElementById("save-product-submit");
    const feedback = document.getElementById("upload-feedback");
    button.disabled = true;
    feedback.textContent = "Uploading…";
    try {
      document.getElementById("edit-product-image").value =
        await adminApi.uploadProductImage(file);
      feedback.textContent = "Photo uploaded. Save the product to publish it.";
    } catch (error) {
      feedback.textContent = error.message;
    } finally {
      button.disabled = false;
      event.target.value = "";
    }
  };

  // Open Add Product
  document
    .getElementById("open-add-product-btn")
    ?.addEventListener("click", () => {
      form.reset();
      sizes.set([]);
      delete form.dataset.dirty;
      document.getElementById("edit-product-id").value = "";
      document.getElementById("product-editor-title").textContent =
        "ADD NEW PRODUCT SPECIFICATION";
      editorModal.classList.add("open");
      playMetallicClick();
    });

  // Close Editor
  document
    .getElementById("close-product-editor")
    ?.addEventListener("click", () => {
      editorModal.classList.remove("open");
    });
  document
    .getElementById("cancel-product-edit")
    ?.addEventListener("click", () => {
      editorModal.classList.remove("open");
    });

  // Edit Product Trigger
  document.querySelectorAll(".edit-product-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const prod = cachedProducts.find((p) => p.id === id);
      if (!prod) return;

      document.getElementById("edit-product-id").value = prod.id;
      document.getElementById("edit-product-title").value = prod.title;
      document.getElementById("edit-product-category").value = prod.category;
      document.getElementById("edit-product-price").value = prod.price;
      document.getElementById("edit-product-tag").value = prod.tag || "";
      document.getElementById("edit-product-stock").value =
        prod.stock_quantity ?? 50;
      document.getElementById("edit-product-image").value = prod.image;
      sizes.set(prod.sizes);
      delete form.dataset.dirty;
      document.getElementById("edit-product-desc").value =
        prod.description || "";

      document.getElementById("edit-product-specs").value = (prod.specs || [])
        .map((s) => `${s.label}: ${s.value}`)
        .join("\n");
      document.getElementById("edit-product-featured").checked =
        !!prod.is_featured;
      document.getElementById("product-editor-title").textContent =
        `EDIT PRODUCT: ${prod.title}`;
      editorModal.classList.add("open");
      playMetallicClick();
    });
  });

  // Save Form
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-product-id").value;
    const payload = {
      title: document.getElementById("edit-product-title").value,
      category: document.getElementById("edit-product-category").value,
      price: document.getElementById("edit-product-price").value,
      tag: document.getElementById("edit-product-tag").value,
      stock_quantity: document.getElementById("edit-product-stock").value,
      image: document.getElementById("edit-product-image").value,
      sizes: sizes.get(),
      description: document.getElementById("edit-product-desc").value,
      specs: document
        .getElementById("edit-product-specs")
        .value.split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const index = line.indexOf(":");
          return {
            label: index < 0 ? line.trim() : line.slice(0, index).trim(),
            value: index < 0 ? "" : line.slice(index + 1).trim(),
          };
        }),
      is_featured: document.getElementById("edit-product-featured").checked,
    };

    const submitBtn = document.getElementById("save-product-submit");
    submitBtn.textContent = "SAVING TO STORE...";
    submitBtn.disabled = true;

    try {
      if (id) {
        await adminApi.updateProduct(id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      playPunchImpact();
      editorModal.classList.remove("open");
      loadProductsTab();
    } catch (err) {
      alert(`Save failed: ${escapeHTML(err.message)}`);
    } finally {
      submitBtn.textContent = "SAVE & PUBLISH TO STORE";
      submitBtn.disabled = false;
    }
  });

  // Delete Product Trigger
  document.querySelectorAll(".delete-product-trigger").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const prod = cachedProducts.find((p) => p.id === id);
      if (
        !confirm(
          `Are you sure you want to decommission and delete "${prod?.title || id}"?`,
        )
      )
        return;

      try {
        await adminApi.deleteProduct(id);
        playPunchImpact();
        loadProductsTab();
      } catch (err) {
        alert(`Delete failed: ${escapeHTML(err.message)}`);
      }
    });
  });

  // Quick Stock Adjust Buttons
  document.querySelectorAll(".stock-up").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const prod = cachedProducts.find((p) => p.id === id);
      if (!prod) return;
      const newStock = (prod.stock_quantity || 0) + 5;
      btn.disabled = true;
      try {
        await adminApi.updateProduct(id, { stock_quantity: newStock });
        playMetallicClick();
        await loadProductsTab();
      } catch (error) {
        alert(error.message);
        btn.disabled = false;
      }
    });
  });

  document.querySelectorAll(".stock-down").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const prod = cachedProducts.find((p) => p.id === id);
      if (!prod) return;
      const newStock = Math.max(0, (prod.stock_quantity || 0) - 5);
      btn.disabled = true;
      try {
        await adminApi.updateProduct(id, { stock_quantity: newStock });
        playMetallicClick();
        await loadProductsTab();
      } catch (error) {
        alert(error.message);
        btn.disabled = false;
      }
    });
  });
}

// -------------------------------------------------------------
// TAB 3: SITE & HERO CUSTOMIZER
// -------------------------------------------------------------
async function loadSettingsTab() {
  const content = document.getElementById("admin-tab-content");
  if (!content) return;

  try {
    cachedSettings = await adminApi.fetchSiteSettings(true);
    const savedHero = cachedSettings.hero_config || {};
    const heroValues =
      savedHero.visual_direction === CURRENT_DIRECTION
        ? savedHero
        : {
            headline_top: "YOUR DAY.",
            headline_bottom: "YOUR WAY.",
            subhead:
              "Hoodies, tracksuits, tees and more. Everyday pieces. Unmistakably you.",
            badge_primary: "THE EVERYDAY COLLECTION",
            cta_primary_text: "Explore the collection",
            cta_secondary_text: "Discover the craft",
            badge_secondary:
              "HOODIES / TRACKSUITS / T-SHIRTS / FASHION / BAGS / OTHERS",
          };
    const hero = Object.fromEntries(
      Object.entries(heroValues).map(([key, value]) => [
        key,
        escapeHTML(value),
      ]),
    );
    const savedAnnouncements = cachedSettings.announcements || {};
    const announcementValues =
      savedAnnouncements.visual_direction === CURRENT_DIRECTION
        ? savedAnnouncements
        : {
            banner_text: "BUILT FOR THE MOMENT. MADE FOR THE EVERYDAY.",
            shipping_text: "WORLDWIDE SHIPPING",
            shipping_threshold: savedAnnouncements.shipping_threshold || 100,
          };
    const announcements = Object.fromEntries(
      Object.entries(announcementValues).map(([key, value]) => [
        key,
        escapeHTML(value),
      ]),
    );

    content.innerHTML = `
      <div class="admin-section-header">
        <div>
          <h3>STOREFRONT & HERO SHOWCASE EDITOR</h3>
          <p style="color:var(--gzn-slate); font-size:0.85rem;">Modify hero headlines, promotional banners, and guarantees. Changes apply to the current workspace.</p>
        </div>
      </div>

      <div class="admin-settings-container">
        <div class="admin-card-setting"><h4 class="setting-card-title">PAGE CONTENT & PHOTOGRAPHY</h4><p>Edit headings, story, help text, policies and images.</p>${contentEditor(cachedSettings.page_content?._direction === CURRENT_DIRECTION ? cachedSettings.page_content : {})}</div>
        <!-- 1. HERO CONFIG -->
        <div class="admin-card-setting">
          <h4 class="setting-card-title">🏆 HERO SHOWCASE STUDIO CONFIGURATION</h4>
          <form id="hero-settings-form" class="admin-form-grid">
            <div class="form-group">
              <label>CAMPAIGN LABEL</label>
              <input type="text" id="set-hero-badge-1" value="${hero.badge_primary || ""}" />
            </div>

            <div class="form-group">
              <label>HERO FOOTNOTE</label>
              <input type="text" id="set-hero-badge-2" value="${hero.badge_secondary || ""}" />
            </div>

            <div class="form-group">
              <label>HEADLINE TOP (SOLID)</label>
              <input type="text" id="set-hero-title-top" value="${hero.headline_top || ""}" />
            </div>

            <div class="form-group">
              <label>HEADLINE BOTTOM (ACCENT)</label>
              <input type="text" id="set-hero-title-bottom" value="${hero.headline_bottom || ""}" />
            </div>

            <div class="form-group full-width">
              <label>HERO SUBHEAD COPY</label>
              <textarea id="set-hero-subhead" rows="2">${hero.subhead || ""}</textarea>
            </div>

            <div class="form-group">
              <label>PRIMARY CTA BUTTON</label>
              <input type="text" id="set-hero-cta-1" value="${hero.cta_primary_text || ""}" />
            </div>

            <div class="form-group">
              <label>SECONDARY CRAFTSMANSHIP TRIGGER</label>
              <input type="text" id="set-hero-cta-2" value="${hero.cta_secondary_text || ""}" />
            </div>

            <div class="form-actions full-width">
              <button type="submit" class="btn-primary" style="padding:0.6rem 1.4rem;">
                ⚡ PUBLISH HERO CONFIG TO LIVE SITE
              </button>
            </div>
          </form>
        </div>

        <!-- 2. ANNOUNCEMENT BAR & GUARANTEES -->
        <div class="admin-card-setting" style="margin-top: 1.5rem;">
          <h4 class="setting-card-title">📢 ANNOUNCEMENT BAR</h4>
          <form id="announcements-form" class="admin-form-grid">
            <div class="form-group">
              <label>TICKER HEADLINE</label>
              <input type="text" id="set-ann-ticker" value="${announcements.banner_text || ""}" />
            </div>

            <div class="form-group">
              <label>FREE SHIPPING TEXT</label>
              <input type="text" id="set-ann-shipping" value="${announcements.shipping_text || ""}" />
            </div>

<div class="form-group">
              <label>FREE SHIPPING THRESHOLD ($)</label>
              <input type="number" id="set-ann-threshold" value="${announcements.shipping_threshold || 150}" />
            </div>

            <div class="form-actions full-width">
              <button type="submit" class="btn-primary" style="padding:0.6rem 1.4rem;">
                ⚡ BROADCAST ANNOUNCEMENTS
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    content.querySelectorAll(".form-group").forEach((group) => {
      const input = group.querySelector("input,textarea,select");
      const label = group.querySelector("label");
      if (input && label) label.htmlFor = input.id;
    });
    document.getElementById("page-content-form").onsubmit = async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      const feedback = document.getElementById("content-feedback");
      try {
        const values = {
          ...Object.fromEntries(new FormData(form)),
          _direction: CURRENT_DIRECTION,
        };
        for (const [key, label, , type] of contentFields)
          if (type === "image" && !validImage(values[key]))
            throw new Error(label + ": enter a /images/ path or HTTPS URL.");
        await adminApi.saveSiteSetting("page_content", values);
        feedback.textContent = isDraft()
          ? "Draft saved. Close the editor to see your changes."
          : "Page content published.";
      } catch (error) {
        feedback.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    };
    // Save Hero Form
    document
      .getElementById("hero-settings-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const updatedHero = {
          visual_direction: CURRENT_DIRECTION,
          badge_primary: document.getElementById("set-hero-badge-1").value,
          badge_secondary: document.getElementById("set-hero-badge-2").value,
          headline_top: document.getElementById("set-hero-title-top").value,
          headline_bottom: document.getElementById("set-hero-title-bottom")
            .value,
          subhead: document.getElementById("set-hero-subhead").value,
          cta_primary_text: document.getElementById("set-hero-cta-1").value,
          cta_secondary_text: document.getElementById("set-hero-cta-2").value,
        };

        try {
          await adminApi.saveSiteSetting("hero_config", updatedHero);
          playPunchImpact();
          alert(
            isDraft() ? "Draft hero saved in this browser." : "Hero published.",
          );
        } catch (err) {
          alert(`Failed to save: ${escapeHTML(err.message)}`);
        }
      });

    // Save Announcements Form
    document
      .getElementById("announcements-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const updatedAnn = {
          visual_direction: CURRENT_DIRECTION,
          banner_text: document.getElementById("set-ann-ticker").value,
          shipping_text: document.getElementById("set-ann-shipping").value,
          shipping_threshold:
            parseFloat(document.getElementById("set-ann-threshold").value) ||
            150,
        };

        try {
          await adminApi.saveSiteSetting("announcements", updatedAnn);
          playPunchImpact();
          alert(
            isDraft()
              ? "Draft announcements saved in this browser."
              : "Announcements published.",
          );
        } catch (err) {
          alert(`Failed to save: ${escapeHTML(err.message)}`);
        }
      });
  } catch (err) {
    content.innerHTML = `<div class="admin-error">Failed to load site settings: ${escapeHTML(err.message)}</div>`;
  }
}

// -------------------------------------------------------------
// TAB 4: DISPATCH & ORDERS
// -------------------------------------------------------------
async function loadOrdersTab() {
  const content = document.getElementById("admin-tab-content");
  if (!content) return;

  try {
    cachedOrders = await adminApi.fetchOrders();

    content.innerHTML = `
      <div class="admin-section-header">
        <div>
          <h3>CUSTOMER ORDERS & FULFILLMENT</h3>
          <p style="color:var(--gzn-slate); font-size:0.85rem;">Manage fulfillment status and inspect clothing and accessory orders.</p>
        </div>
        <button class="btn-secondary" id="refresh-orders-btn" style="font-size:0.75rem; padding:0.4rem 0.8rem;">
          🔄 REFRESH
        </button>
      </div>

      ${
        cachedOrders.length === 0
          ? `
        <div class="admin-empty-state">
          📦 No customer orders recorded yet. When a customer checks out, their order is captured immediately.
        </div>
      `
          : `
        <div class="admin-orders-list">
          ${cachedOrders
            .map(
              (order) => `
            <div class="admin-order-card" data-id="${order.id}">
              <div class="order-card-header">
                <div>
                  <span class="mono-tag" style="background:#f1f5f9; color:#b45309; border:1px solid #e2e8f0; font-weight:700;">[ ORDER #${order.id.substring(0, 8)} ]</span>
                  <div style="font-weight:700; font-size:1.05rem; margin-top:0.2rem; color:#0f172a;">${escapeHTML(order.customer_name)}</div>
                  <div style="font-size:0.8rem; color:var(--gzn-slate);">${escapeHTML(order.customer_email)} ${order.customer_phone ? " • " + escapeHTML(order.customer_phone) : ""}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-family:var(--font-mono); font-size:1.3rem; font-weight:700; color:#b45309;">
                    $${parseFloat(order.total).toFixed(2)}
                  </div>
                  <div class="order-status-ctrl">
                    <label style="font-size:0.65rem; color:#475569; font-weight:600;">STATUS:</label>
                    <select class="order-status-select" data-id="${order.id}">
                      <option value="PENDING" ${order.status === "PENDING" ? "selected" : ""}>PENDING</option>
                      <option value="PROCESSING" ${order.status === "PROCESSING" ? "selected" : ""}>PROCESSING</option>
                      <option value="DISPATCHED" ${order.status === "DISPATCHED" ? "selected" : ""}>DISPATCHED</option>
                      <option value="DELIVERED" ${order.status === "DELIVERED" ? "selected" : ""}>DELIVERED</option>
                      <option value="CANCELLED" ${order.status === "CANCELLED" ? "selected" : ""}>CANCELLED</option>
                    </select>
                  </div>
                </div>
              </div>

              <p class="order-address"><strong>Shipping address:</strong> ${escapeHTML(typeof order.shipping_address === "object" ? order.shipping_address?.address || JSON.stringify(order.shipping_address) : order.shipping_address || "Not provided")}</p>
              <!-- ITEMS LIST -->
              <div class="order-items-breakdown">
                ${
                  Array.isArray(order.items)
                    ? order.items
                        .map(
                          (it) => `
                  <div class="order-sub-item">
                    <span>${escapeHTML(it.title || "GNZSPORTS Product")} (x${it.quantity}) [${escapeHTML(it.size || "STD")}]</span>
                    <span style="font-family:var(--font-mono); font-weight:700;">$${((parseFloat(it.price) || 0) * (it.quantity || 1)).toFixed(2)}</span>
                  </div>
                `,
                        )
                        .join("")
                    : '<span style="color:#666;">Items payload</span>'
                }
              </div>

              <div class="order-footer-meta">
                <span class="mono-tag" style="font-size:0.68rem; background:#f8fafc; color:#475569; border:1px solid #e2e8f0;">DATE: ${new Date(order.created_at).toLocaleString()}</span>
                <span class="mono-tag" style="font-size:0.68rem; background:#ecfdf5; color:#059669; border:1px solid #a7f3d0;">PAYMENT: ${escapeHTML(order.payment_status || "UNPAID")}</span>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
      }
    `;

    document
      .getElementById("refresh-orders-btn")
      ?.addEventListener("click", () => {
        playMetallicClick();
        loadOrdersTab();
      });

    // Order status changes
    content.querySelectorAll(".order-status-select").forEach((sel) => {
      const status = cachedOrders.find((o) => o.id === sel.dataset.id)?.status;
      for (const option of sel.options)
        option.disabled =
          option.value !== status &&
          !nextOrderStatuses[status]?.includes(option.value);
      sel.addEventListener("change", async (e) => {
        const orderId = e.target.getAttribute("data-id");
        const newStatus = e.target.value;
        e.target.disabled = true;
        try {
          await adminApi.updateOrderStatus(orderId, newStatus);
          playMetallicClick();
          await loadOrdersTab();
        } catch (err) {
          e.target.value =
            cachedOrders.find((order) => order.id === orderId)?.status ||
            "PENDING";
          alert(`Failed to update status: ${err.message}`);
        } finally {
          e.target.disabled = false;
        }
      });
    });
  } catch (err) {
    content.innerHTML = `<div class="admin-error">Failed to load orders: ${escapeHTML(err.message)}</div>`;
  }
}
