// GZNSPORTS // MASTER ADMINISTRATIVE COMMAND CONSOLE
import { adminApi } from './lib/admin-api.js';
import { realtimeEngine } from './lib/realtime-engine.js';
import { auth } from './lib/supabase.js';
import { playMetallicClick, playPunchImpact } from './audio.js';

let isAdminOpen = false;
let currentTab = 'overview';
let cachedProducts = [];
let cachedOrders = [];
let cachedSettings = {};

export function initAdminPanel() {
  renderAdminContainer();
  attachAdminTriggers();
  subscribeToRealtime();
}

function renderAdminContainer() {
  let container = document.getElementById('gzn-admin-overlay');
  if (!container) {
    container = document.createElement('div');
    container.id = 'gzn-admin-overlay';
    container.className = 'admin-overlay';
    document.body.appendChild(container);
  }
}

export function openAdminPanel() {
  isAdminOpen = true;
  playMetallicClick();
  const overlay = document.getElementById('gzn-admin-overlay');
  if (overlay) {
    overlay.classList.add('open');
    renderAdminUI();
  }
}

export function closeAdminPanel() {
  isAdminOpen = false;
  playMetallicClick();
  const overlay = document.getElementById('gzn-admin-overlay');
  if (overlay) {
    overlay.classList.remove('open');
  }
}

function attachAdminTriggers() {
  // Listen for escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isAdminOpen) {
      closeAdminPanel();
    }
  });
}

function subscribeToRealtime() {
  realtimeEngine.init();

  realtimeEngine.onStatusChange((status) => {
    const pulseEl = document.getElementById('admin-realtime-status');
    if (pulseEl) {
      pulseEl.className = `admin-status-badge ${status.toLowerCase()}`;
      pulseEl.innerHTML = `<span class="pulse-dot"></span> REALTIME: ${status}`;
    }
  });

  realtimeEngine.onProductChange(() => {
    if (isAdminOpen && currentTab === 'products') {
      loadProductsTab();
    }
  });

  realtimeEngine.onSettingsChange(() => {
    if (isAdminOpen && currentTab === 'settings') {
      loadSettingsTab();
    }
  });

  realtimeEngine.onOrderChange(() => {
    if (isAdminOpen && (currentTab === 'orders' || currentTab === 'overview')) {
      loadOverviewTab();
      if (currentTab === 'orders') loadOrdersTab();
    }
  });
}

async function renderAdminUI() {
  const overlay = document.getElementById('gzn-admin-overlay');
  if (!overlay) return;

  const status = realtimeEngine.getStatus();

  overlay.innerHTML = `
    <div class="admin-modal">
      <!-- HEADER -->
      <div class="admin-header">
        <div class="admin-header-title">
          <div class="admin-brand">
            <span class="mono-tag crimson">[ GZN COMMAND MATRIX ]</span>
            <h2>TACTICAL ADMIN CONSOLE</h2>
          </div>
          <div id="admin-realtime-status" class="admin-status-badge ${status.toLowerCase()}">
            <span class="pulse-dot"></span> REALTIME: ${status}
          </div>
        </div>
        <button class="admin-close-btn" id="admin-close-btn" title="Close Console">✕</button>
      </div>

      <!-- NAVIGATION TABS -->
      <div class="admin-nav-tabs">
        <button class="admin-tab-btn ${currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
          📊 TELEMETRY & OVERVIEW
        </button>
        <button class="admin-tab-btn ${currentTab === 'products' ? 'active' : ''}" data-tab="products">
          🥊 PRODUCT ARMORY (CRUD)
        </button>
        <button class="admin-tab-btn ${currentTab === 'settings' ? 'active' : ''}" data-tab="settings">
          ⚙️ SITE & HERO CUSTOMIZER
        </button>
        <button class="admin-tab-btn ${currentTab === 'orders' ? 'active' : ''}" data-tab="orders">
          📦 DISPATCH & ORDERS
        </button>
      </div>

      <!-- MAIN TAB CONTENT AREA -->
      <div class="admin-content-area" id="admin-tab-content">
        <div class="admin-loading-spinner">
          <span class="spinner-ring"></span>
          <span>INITIALIZING SECURE DATA LINK...</span>
        </div>
      </div>
    </div>
  `;

  // Attach Header Events
  document.getElementById('admin-close-btn')?.addEventListener('click', closeAdminPanel);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAdminPanel();
  });

  // Tab switching
  overlay.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');
      playMetallicClick();
      loadTabContent();
    });
  });

  loadTabContent();
}

function loadTabContent() {
  if (currentTab === 'overview') loadOverviewTab();
  else if (currentTab === 'products') loadProductsTab();
  else if (currentTab === 'settings') loadSettingsTab();
  else if (currentTab === 'orders') loadOrdersTab();
}

// -------------------------------------------------------------
// TAB 1: TELEMETRY & OVERVIEW
// -------------------------------------------------------------
async function loadOverviewTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  try {
    const metrics = await adminApi.getDashboardMetrics();
    content.innerHTML = `
      <div class="admin-metrics-grid">
        <div class="metric-box">
          <div class="metric-top">
            <span class="mono-tag crimson">TOTAL REVENUE</span>
            <span class="metric-icon">💰</span>
          </div>
          <div class="metric-big-number">$${metrics.totalRevenue.toFixed(2)}</div>
          <span class="metric-sub">Processed through combat checkout</span>
        </div>

        <div class="metric-box">
          <div class="metric-top">
            <span class="mono-tag">TOTAL ORDERS</span>
            <span class="metric-icon">📦</span>
          </div>
          <div class="metric-big-number">${metrics.totalOrders}</div>
          <span class="metric-sub">Customer dispatches recorded</span>
        </div>

        <div class="metric-box">
          <div class="metric-top">
            <span class="mono-tag">CATALOG INVENTORY</span>
            <span class="metric-icon">🛡️</span>
          </div>
          <div class="metric-big-number">${metrics.totalProducts}</div>
          <span class="metric-sub">Live products in database</span>
        </div>

        <div class="metric-box">
          <div class="metric-top">
            <span class="mono-tag" style="color: #ff9900;">LOW STOCK ALERT</span>
            <span class="metric-icon">⚠️</span>
          </div>
          <div class="metric-big-number" style="color: ${metrics.lowStockCount > 0 ? '#ff4d6d' : 'var(--gzn-titanium)'};">
            ${metrics.lowStockCount}
          </div>
          <span class="metric-sub">Items below 30 units threshold</span>
        </div>
      </div>

      <div class="admin-section-block">
        <div class="admin-section-header">
          <h3>RECENT COMBAT DISPATCHES</h3>
          <button class="btn-secondary" style="font-size: 0.72rem; padding: 0.4rem 0.8rem;" id="refresh-overview-btn">
            🔄 REFRESH METRICS
          </button>
        </div>

        ${metrics.recentOrders.length === 0 ? `
          <div class="admin-empty-state">No orders registered in the system yet. Customer purchases will appear here live.</div>
        ` : `
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
              ${metrics.recentOrders.map(o => `
                <tr>
                  <td class="mono-tag">${o.id.substring(0, 8)}...</td>
                  <td><strong>${o.customer_name}</strong><br><span style="font-size:0.75rem; color:#888;">${o.customer_email}</span></td>
                  <td style="font-family:var(--font-mono); font-weight:700;">$${parseFloat(o.total).toFixed(2)}</td>
                  <td><span class="status-pill status-${(o.status || 'pending').toLowerCase()}">${o.status}</span></td>
                  <td class="mono-tag">${new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;

    document.getElementById('refresh-overview-btn')?.addEventListener('click', () => {
      playMetallicClick();
      loadOverviewTab();
    });
  } catch (err) {
    content.innerHTML = `<div class="admin-error">Failed to load telemetry: ${err.message}</div>`;
  }
}

// -------------------------------------------------------------
// TAB 2: PRODUCT ARMORY (CRUD)
// -------------------------------------------------------------
async function loadProductsTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  try {
    cachedProducts = await adminApi.fetchProducts(true);

    content.innerHTML = `
      <div class="admin-section-header">
        <div>
          <h3>ARMORY WEAPONRY INVENTORY</h3>
          <p style="color:var(--gzn-slate); font-size:0.85rem;">Create, edit, modify pricing, and manage stock in real time.</p>
        </div>
        <button class="btn-primary" id="open-add-product-btn" style="padding:0.6rem 1.2rem; font-size:0.8rem;">
          + DEPLOY NEW PRODUCT
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
            ${cachedProducts.map(p => `
              <tr data-id="${p.id}">
                <td>
                  <img src="${p.image}" alt="${p.title}" style="width:48px; height:48px; object-fit:cover; border-radius:2px; border:1px solid #333;" />
                </td>
                <td>
                  <strong>${p.title}</strong>
                  <div style="font-size:0.75rem; color:var(--gzn-slate); max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    ${p.description || ''}
                  </div>
                </td>
                <td><span class="mono-tag">${p.category.toUpperCase()}</span></td>
                <td style="font-family:var(--font-mono); font-weight:700; color:var(--gzn-gold-seal); font-size:1.05rem;">
                  $${parseFloat(p.price).toFixed(2)}
                </td>
                <td>
                  <div class="stock-counter-wrap">
                    <button class="stock-btn stock-down" data-id="${p.id}">-</button>
                    <span class="stock-val mono-tag ${p.stock_quantity < 30 ? 'low' : ''}">${p.stock_quantity || 0}</span>
                    <button class="stock-btn stock-up" data-id="${p.id}">+</button>
                  </div>
                </td>
                <td><span class="card-tag-badge" style="position:static; font-size:0.65rem;">${p.tag || 'STANDARD'}</span></td>
                <td>
                  <div style="display:flex; gap:0.4rem;">
                    <button class="admin-icon-btn edit-product-trigger" data-id="${p.id}" title="Edit Product">✏️</button>
                    <button class="admin-icon-btn delete-product-trigger" data-id="${p.id}" title="Delete Product" style="color:#ff4d6d;">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- SUB-MODAL FOR CREATE / EDIT PRODUCT -->
      <div id="product-editor-modal" class="admin-sub-modal">
        <div class="admin-sub-modal-content">
          <div class="admin-sub-header">
            <h4 id="product-editor-title">DEPLOY NEW WEAPONRY SPECIFICATION</h4>
            <button class="admin-close-btn" id="close-product-editor">✕</button>
          </div>
          <form id="product-editor-form" class="admin-form-grid">
            <input type="hidden" id="edit-product-id" />
            
            <div class="form-group full-width">
              <label>PRODUCT TITLE</label>
              <input type="text" id="edit-product-title" placeholder="e.g. WWE Undisputed Championship Title Belt" required />
            </div>

            <div class="form-group">
              <label>CATEGORY</label>
              <select id="edit-product-category">
                <option value="belts">🏆 WRESTLING TITLE BELTS</option>
                <option value="hoodies">🧥 450GSM HOODIES</option>
                <option value="accessories">🛡️ ACCESSORIES & MOUNTS</option>
              </select>
            </div>

            <div class="form-group">
              <label>PRICE (USD $)</label>
              <input type="number" id="edit-product-price" step="0.01" min="0" placeholder="185.00" required />
            </div>

            <div class="form-group">
              <label>BADGE TAG</label>
              <input type="text" id="edit-product-tag" placeholder="FLAGSHIP 24K DUAL-PLATED" />
            </div>

            <div class="form-group">
              <label>STOCK QUANTITY</label>
              <input type="number" id="edit-product-stock" min="0" value="50" required />
            </div>

            <div class="form-group full-width">
              <label>IMAGE URL / PATH</label>
              <input type="text" id="edit-product-image" placeholder="/images/belts/world-heavyweight-belt.jpg or URL" required />
            </div>

            <div class="form-group full-width">
              <label>SIZES (COMMA SEPARATED)</label>
              <input type="text" id="edit-product-sizes" placeholder="S, M, L, XL, 2XL or 52-54 INCH ADULT REPLICA" />
            </div>

            <div class="form-group full-width">
              <label>PRODUCT DESCRIPTION</label>
              <textarea id="edit-product-desc" rows="3" placeholder="Engineered for champions..."></textarea>
            </div>

            <div class="form-actions full-width">
              <button type="button" class="btn-secondary" id="cancel-product-edit">CANCEL</button>
              <button type="submit" class="btn-primary" id="save-product-submit">SAVE & PUBLISH TO SUPABASE</button>
            </div>
          </form>
        </div>
      </div>
    `;

    attachProductEvents();
  } catch (err) {
    content.innerHTML = `<div class="admin-error">Failed to load product armory: ${err.message}</div>`;
  }
}

function attachProductEvents() {
  const editorModal = document.getElementById('product-editor-modal');
  const form = document.getElementById('product-editor-form');

  // Open Add Product
  document.getElementById('open-add-product-btn')?.addEventListener('click', () => {
    form.reset();
    document.getElementById('edit-product-id').value = '';
    document.getElementById('product-editor-title').textContent = 'DEPLOY NEW WEAPONRY SPECIFICATION';
    editorModal.classList.add('open');
    playMetallicClick();
  });

  // Close Editor
  document.getElementById('close-product-editor')?.addEventListener('click', () => {
    editorModal.classList.remove('open');
  });
  document.getElementById('cancel-product-edit')?.addEventListener('click', () => {
    editorModal.classList.remove('open');
  });

  // Edit Product Trigger
  document.querySelectorAll('.edit-product-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const prod = cachedProducts.find(p => p.id === id);
      if (!prod) return;

      document.getElementById('edit-product-id').value = prod.id;
      document.getElementById('edit-product-title').value = prod.title;
      document.getElementById('edit-product-category').value = prod.category;
      document.getElementById('edit-product-price').value = prod.price;
      document.getElementById('edit-product-tag').value = prod.tag || '';
      document.getElementById('edit-product-stock').value = prod.stock_quantity || 50;
      document.getElementById('edit-product-image').value = prod.image;
      document.getElementById('edit-product-sizes').value = Array.isArray(prod.sizes) ? prod.sizes.join(', ') : prod.sizes;
      document.getElementById('edit-product-desc').value = prod.description || '';

      document.getElementById('product-editor-title').textContent = `EDIT SPECIFICATION: ${prod.title}`;
      editorModal.classList.add('open');
      playMetallicClick();
    });
  });

  // Save Form
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-product-id').value;
    const payload = {
      title: document.getElementById('edit-product-title').value,
      category: document.getElementById('edit-product-category').value,
      price: document.getElementById('edit-product-price').value,
      tag: document.getElementById('edit-product-tag').value,
      stock_quantity: document.getElementById('edit-product-stock').value,
      image: document.getElementById('edit-product-image').value,
      sizes: document.getElementById('edit-product-sizes').value,
      description: document.getElementById('edit-product-desc').value
    };

    const submitBtn = document.getElementById('save-product-submit');
    submitBtn.textContent = 'SAVING TO SUPABASE...';
    submitBtn.disabled = true;

    try {
      if (id) {
        await adminApi.updateProduct(id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      playPunchImpact();
      editorModal.classList.remove('open');
      loadProductsTab();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      submitBtn.textContent = 'SAVE & PUBLISH TO SUPABASE';
      submitBtn.disabled = false;
    }
  });

  // Delete Product Trigger
  document.querySelectorAll('.delete-product-trigger').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const prod = cachedProducts.find(p => p.id === id);
      if (!confirm(`Are you sure you want to decommission and delete "${prod?.title || id}"?`)) return;

      try {
        await adminApi.deleteProduct(id);
        playPunchImpact();
        loadProductsTab();
      } catch (err) {
        alert(`Delete failed: ${err.message}`);
      }
    });
  });

  // Quick Stock Adjust Buttons
  document.querySelectorAll('.stock-up').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const prod = cachedProducts.find(p => p.id === id);
      if (!prod) return;
      const newStock = (prod.stock_quantity || 0) + 5;
      await adminApi.updateProduct(id, { stock_quantity: newStock });
      playMetallicClick();
      loadProductsTab();
    });
  });

  document.querySelectorAll('.stock-down').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const prod = cachedProducts.find(p => p.id === id);
      if (!prod) return;
      const newStock = Math.max(0, (prod.stock_quantity || 0) - 5);
      await adminApi.updateProduct(id, { stock_quantity: newStock });
      playMetallicClick();
      loadProductsTab();
    });
  });
}

// -------------------------------------------------------------
// TAB 3: SITE & HERO CUSTOMIZER
// -------------------------------------------------------------
async function loadSettingsTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  try {
    cachedSettings = await adminApi.fetchSiteSettings(true);
    const hero = cachedSettings.hero_config || {};
    const announcements = cachedSettings.announcements || {};
    const manifesto = cachedSettings.manifesto || {};

    content.innerHTML = `
      <div class="admin-section-header">
        <div>
          <h3>LIVE SITE & CONTENT CUSTOMIZER</h3>
          <p style="color:var(--gzn-slate); font-size:0.85rem;">Modify hero headlines, promotional banners, and brand manifesto. Changes apply instantly to public storefront.</p>
        </div>
      </div>

      <div class="admin-settings-container">
        <!-- 1. HERO CONFIG -->
        <div class="admin-card-setting">
          <h4 class="setting-card-title">🏆 3D HERO VIEWPORT CONFIGURATION</h4>
          <form id="hero-settings-form" class="admin-form-grid">
            <div class="form-group">
              <label>PRIMARY CRIMSON BADGE</label>
              <input type="text" id="set-hero-badge-1" value="${hero.badge_primary || ''}" />
            </div>

            <div class="form-group">
              <label>SECONDARY SPEC BADGE</label>
              <input type="text" id="set-hero-badge-2" value="${hero.badge_secondary || ''}" />
            </div>

            <div class="form-group">
              <label>HEADLINE TOP (SOLID)</label>
              <input type="text" id="set-hero-title-top" value="${hero.headline_top || ''}" />
            </div>

            <div class="form-group">
              <label>HEADLINE BOTTOM (OUTLINE ACCENT)</label>
              <input type="text" id="set-hero-title-bottom" value="${hero.headline_bottom || ''}" />
            </div>

            <div class="form-group full-width">
              <label>HERO SUBHEAD COPY</label>
              <textarea id="set-hero-subhead" rows="2">${hero.subhead || ''}</textarea>
            </div>

            <div class="form-group">
              <label>PRIMARY CTA BUTTON</label>
              <input type="text" id="set-hero-cta-1" value="${hero.cta_primary_text || ''}" />
            </div>

            <div class="form-group">
              <label>SECONDARY 3D LAB TRIGGER</label>
              <input type="text" id="set-hero-cta-2" value="${hero.cta_secondary_text || ''}" />
            </div>

            <div class="form-group">
              <label>3D HUD PIN 01 (TOP LEFT)</label>
              <input type="text" id="set-hero-pin-1" value="${hero.pin_top_text || ''}" />
            </div>

            <div class="form-group">
              <label>3D HUD PIN 02 (BOTTOM RIGHT)</label>
              <input type="text" id="set-hero-pin-2" value="${hero.pin_bottom_text || ''}" />
            </div>

            <div class="form-actions full-width">
              <button type="submit" class="btn-primary" style="padding:0.6rem 1.4rem;">
                ⚡ BROADCAST HERO CONFIG TO LIVE SITE
              </button>
            </div>
          </form>
        </div>

        <!-- 2. ANNOUNCEMENT BAR & GUARANTEES -->
        <div class="admin-card-setting" style="margin-top: 1.5rem;">
          <h4 class="setting-card-title">📢 ANNOUNCEMENTS & POLICIES</h4>
          <form id="announcements-form" class="admin-form-grid">
            <div class="form-group">
              <label>TICKER HEADLINE</label>
              <input type="text" id="set-ann-ticker" value="${announcements.banner_text || ''}" />
            </div>

            <div class="form-group">
              <label>FREE SHIPPING TEXT</label>
              <input type="text" id="set-ann-shipping" value="${announcements.shipping_text || ''}" />
            </div>

            <div class="form-group">
              <label>STRIKE WARRANTY TEXT</label>
              <input type="text" id="set-ann-warranty" value="${announcements.warranty_text || ''}" />
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

    // Save Hero Form
    document.getElementById('hero-settings-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedHero = {
        badge_primary: document.getElementById('set-hero-badge-1').value,
        badge_secondary: document.getElementById('set-hero-badge-2').value,
        headline_top: document.getElementById('set-hero-title-top').value,
        headline_bottom: document.getElementById('set-hero-title-bottom').value,
        subhead: document.getElementById('set-hero-subhead').value,
        cta_primary_text: document.getElementById('set-hero-cta-1').value,
        cta_secondary_text: document.getElementById('set-hero-cta-2').value,
        pin_top_text: document.getElementById('set-hero-pin-1').value,
        pin_bottom_text: document.getElementById('set-hero-pin-2').value
      };

      try {
        await adminApi.saveSiteSetting('hero_config', updatedHero);
        playPunchImpact();
        alert('✓ Hero configuration saved to Supabase and broadcast to live storefront!');
      } catch (err) {
        alert(`Failed to save: ${err.message}`);
      }
    });

    // Save Announcements Form
    document.getElementById('announcements-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedAnn = {
        banner_text: document.getElementById('set-ann-ticker').value,
        shipping_text: document.getElementById('set-ann-shipping').value,
        warranty_text: document.getElementById('set-ann-warranty').value,
        shipping_threshold: parseFloat(document.getElementById('set-ann-threshold').value) || 150
      };

      try {
        await adminApi.saveSiteSetting('announcements', updatedAnn);
        playPunchImpact();
        alert('✓ Announcements saved to Supabase and broadcast live!');
      } catch (err) {
        alert(`Failed to save: ${err.message}`);
      }
    });
  } catch (err) {
    content.innerHTML = `<div class="admin-error">Failed to load site settings: ${err.message}</div>`;
  }
}

// -------------------------------------------------------------
// TAB 4: DISPATCH & ORDERS
// -------------------------------------------------------------
async function loadOrdersTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  try {
    cachedOrders = await adminApi.fetchOrders();

    content.innerHTML = `
      <div class="admin-section-header">
        <div>
          <h3>CUSTOMER ORDERS & DISPATCH</h3>
          <p style="color:var(--gzn-slate); font-size:0.85rem;">Manage fulfillment status and inspect combat gear orders.</p>
        </div>
        <button class="btn-secondary" id="refresh-orders-btn" style="font-size:0.75rem; padding:0.4rem 0.8rem;">
          🔄 REFRESH
        </button>
      </div>

      ${cachedOrders.length === 0 ? `
        <div class="admin-empty-state">
          🛡️ No customer orders recorded yet. When a fighter checks out, their order is captured immediately.
        </div>
      ` : `
        <div class="admin-orders-list">
          ${cachedOrders.map(order => `
            <div class="admin-order-card" data-id="${order.id}">
              <div class="order-card-header">
                <div>
                  <span class="mono-tag crimson">[ ORDER #${order.id.substring(0, 8)} ]</span>
                  <div style="font-weight:700; font-size:1.05rem; margin-top:0.2rem;">${order.customer_name}</div>
                  <div style="font-size:0.8rem; color:var(--gzn-slate);">${order.customer_email} ${order.customer_phone ? ' • ' + order.customer_phone : ''}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-family:var(--font-mono); font-size:1.3rem; font-weight:700; color:var(--gzn-gold-seal);">
                    $${parseFloat(order.total).toFixed(2)}
                  </div>
                  <div class="order-status-ctrl">
                    <label style="font-size:0.65rem; color:#888;">STATUS:</label>
                    <select class="order-status-select" data-id="${order.id}">
                      <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
                      <option value="PROCESSING" ${order.status === 'PROCESSING' ? 'selected' : ''}>PROCESSING</option>
                      <option value="DISPATCHED" ${order.status === 'DISPATCHED' ? 'selected' : ''}>DISPATCHED</option>
                      <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
                      <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- ITEMS LIST -->
              <div class="order-items-breakdown">
                ${Array.isArray(order.items) ? order.items.map(it => `
                  <div class="order-sub-item">
                    <span>${it.title || 'Combat Weaponry'} (x${it.quantity}) [${it.size || 'STD'}]</span>
                    <span style="font-family:var(--font-mono);">$${((parseFloat(it.price) || 0) * (it.quantity || 1)).toFixed(2)}</span>
                  </div>
                `).join('') : '<span style="color:#666;">Items payload</span>'}
              </div>

              <div class="order-footer-meta">
                <span class="mono-tag" style="font-size:0.68rem;">DATE: ${new Date(order.created_at).toLocaleString()}</span>
                <span class="mono-tag" style="font-size:0.68rem; color:#27c93f;">PAYMENT: ${order.payment_status || 'PAID'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;

    document.getElementById('refresh-orders-btn')?.addEventListener('click', () => {
      playMetallicClick();
      loadOrdersTab();
    });

    // Order status changes
    content.querySelectorAll('.order-status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const orderId = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        try {
          await adminApi.updateOrderStatus(orderId, newStatus);
          playMetallicClick();
        } catch (err) {
          alert(`Failed to update status: ${err.message}`);
        }
      });
    });
  } catch (err) {
    content.innerHTML = `<div class="admin-error">Failed to load orders: ${err.message}</div>`;
  }
}
