// GENZ SPORTS // MASTER APPLICATION ORCHESTRATOR
import { initCursor } from './cursor.js';
import { PRODUCTS, store } from './store.js';
import { toggleSound, isSoundEnabled, playPunchImpact, playMetallicClick } from './audio.js';
import { initAdminPanel, openAdminPanel } from './admin.js';
import { initAuthModal, openAuthModal } from './auth-modal.js';
import { initModals, openSearchModal, openModal } from './modals.js';
import { adminApi } from './lib/admin-api.js';
import { realtimeEngine } from './lib/realtime-engine.js';
import { auth } from './lib/supabase.js';

let currentCategory = 'all';

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  renderApp();
  initCursor();
  initModals();
  initAdminPanel();
  initAuthModal();

  // Subscribe to Store changes
  store.subscribe(updateCartUI);

  // Setup Event Handlers
  setupEventListeners();
  updateCartUI();

  // Supabase Backend Data Sync & Realtime Engine
  await syncCatalogFromBackend();
  await syncSiteSettingsFromBackend();
  initRealtimeAutoRefresh();
  initAuthSessionWatcher();
});


function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- 0. TOP ANNOUNCEMENT BAR (GENZ TICKER) -->
    <div class="top-announcement-bar">
      <div class="announcement-inner">
        <div class="announcement-pill" id="announcement-pill-container">
          <span>⚡ MOVE. IMPROVE. EVOLVE.</span>
          <span class="announcement-sep">|</span>
          <span>FREE WORLDWIDE AIR DISPATCH OVER $100</span>
          <span class="announcement-sep">|</span>
          <span>365-DAY STRIKE & SNAP WARRANTY</span>
        </div>
        <div class="announcement-right-links">
          <a href="#lab" class="announcement-link" data-modal="lab">FIGHT LAB</a>
          <span class="announcement-sep">|</span>
          <a href="#why" class="announcement-link" data-modal="why">WHY GENZ?</a>
          <span class="announcement-sep">|</span>
          <a href="#faq" class="announcement-link" data-modal="faq">HELP / FAQ</a>
        </div>
      </div>
    </div>

    <!-- 1. OFFICIAL ATHLETIC HEADER -->
    <header class="rdx-main-header" id="rdx-main-header">
      <div class="rdx-header-inner">
        
        <!-- BRAND LOGO (GENZ COMBAT EMBLEM) -->
        <a href="#" class="rdx-brand-wrap" aria-label="GENZ SPORTS Home">
          <img src="/images/genz-3d-logo.png" alt="GENZ SPORTS" class="genz-header-logo" />
        </a>

        <!-- CENTER NAVIGATION LINKS -->
        <nav class="rdx-nav-menu" aria-label="Primary Navigation">
          <!-- WRESTLING BELTS -->
          <div class="rdx-nav-item has-dropdown">
            <a href="#armory" class="rdx-nav-link" data-cat="belts">
              <span>WRESTLING BELTS</span>
              <svg class="chevron-icon" viewBox="0 0 10 6" width="9" height="5"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            </a>
            <div class="rdx-mega-menu">
              <div class="mega-column">
                <h4 class="mega-heading">TITLE BELTS</h4>
                <a href="#armory" class="mega-link" data-cat="belts">WWE Undisputed Championship</a>
                <a href="#armory" class="mega-link" data-cat="belts">World Heavyweight "Big Gold"</a>
                <a href="#armory" class="mega-link" data-cat="belts">Intercontinental Dual-Globe</a>
                <a href="#armory" class="mega-link" data-cat="belts">Custom Promotion Title Belts</a>
              </div>
              <div class="mega-column">
                <h4 class="mega-heading">BELT CRAFTSMANSHIP</h4>
                <a href="#armory" class="mega-link" data-cat="belts">8mm Solid CNC Brass Casting</a>
                <a href="#armory" class="mega-link" data-cat="belts">24K Dual-Dip Electroplating</a>
                <a href="#armory" class="mega-link" data-cat="belts">4mm Full-Grain Saddle Leather</a>
                <a href="#armory" class="mega-link" data-cat="belts">Hand-Set Diamond Gemstones</a>
              </div>
              <div class="mega-column">
                <h4 class="mega-heading">DISPLAY & MOUNTS</h4>
                <a href="#armory" class="mega-link" data-cat="accessories">Heavy-Duty Steel Wall Mount</a>
                <a href="#armory" class="mega-link" data-cat="accessories">Luxury Velvet Travel Armor Case</a>
                <a href="#armory" class="mega-link" data-cat="accessories">Polished Acrylic Table Cradle</a>
                <a href="#armory" class="mega-link" data-cat="accessories">Gold Replacement Snap Screws</a>
              </div>
              <div class="mega-featured">
                <img src="/images/belts/world-heavyweight-belt.jpg" alt="Featured Title Belt" />
                <div class="mega-featured-info">
                  <span class="mono-tag" style="color:#b71234;">BEST SELLER</span>
                  <strong>WORLD HEAVYWEIGHT "BIG GOLD"</strong>
                  <span class="featured-price">$449.00</span>
                  <a href="#armory" class="mega-featured-btn">SHOP TITLE BELTS →</a>
                </div>
              </div>
            </div>
          </div>

          <!-- 450GSM HOODIES -->
          <div class="rdx-nav-item has-dropdown">
            <a href="#armory" class="rdx-nav-link" data-cat="hoodies">
              <span>450GSM HOODIES</span>
              <svg class="chevron-icon" viewBox="0 0 10 6" width="9" height="5"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            </a>
            <div class="rdx-mega-menu">
              <div class="mega-column">
                <h4 class="mega-heading">COMBAT STREETWEAR</h4>
                <a href="#armory" class="mega-link" data-cat="hoodies">GENZ Apex 450GSM Heavyweight</a>
                <a href="#armory" class="mega-link" data-cat="hoodies">Raw-Cut Vintage Mineral Wash</a>
                <a href="#armory" class="mega-link" data-cat="hoodies">Championship Dual Full-Zip</a>
                <a href="#armory" class="mega-link" data-cat="hoodies">Drop-Shoulder Oversized Cut</a>
              </div>
              <div class="mega-column">
                <h4 class="mega-heading">TEXTILE STANDARDS</h4>
                <a href="#armory" class="mega-link" data-cat="hoodies">450GSM Combed Long-Staple Cotton</a>
                <a href="#armory" class="mega-link" data-cat="hoodies">Double-Layer Structured Hood</a>
                <a href="#armory" class="mega-link" data-cat="hoodies">24K Gold Dipped Metal Aglets</a>
                <a href="#armory" class="mega-link" data-cat="hoodies">High-Density Chrome Chest Crest</a>
              </div>
              <div class="mega-featured">
                <img src="/images/hoodies/genz-heavyweight-hoodie.jpg" alt="Featured Hoodie" />
                <div class="mega-featured-info">
                  <span class="mono-tag" style="color:#b71234;">APEX HEAVYWEIGHT</span>
                  <strong>GENZ 450GSM COMBAT HOODIE</strong>
                  <span class="featured-price">$120.00</span>
                  <a href="#armory" class="mega-featured-btn">SHOP HOODIES →</a>
                </div>
              </div>
            </div>
          </div>

          <!-- ACCESSORIES -->
          <div class="rdx-nav-item has-dropdown">
            <a href="#armory" class="rdx-nav-link" data-cat="accessories">
              <span>ACCESSORIES</span>
              <svg class="chevron-icon" viewBox="0 0 10 6" width="9" height="5"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            </a>
            <div class="rdx-mega-menu" style="width: 480px;">
              <div class="mega-column">
                <h4 class="mega-heading">ARMORY ACCESSORIES</h4>
                <a href="#armory" class="mega-link" data-cat="accessories">Laser-Cut Steel Belt Wall Mount</a>
                <a href="#armory" class="mega-link" data-cat="accessories">Velvet & Ballistic Nylon Travel Case</a>
                <a href="#armory" class="mega-link" data-cat="accessories">Replacement Brass Snap Hardware</a>
              </div>
            </div>
          </div>

          <!-- CUSTOM LAB -->
          <div class="rdx-nav-item">
            <a href="#lab" class="rdx-nav-link" data-modal="lab">
              <span>CUSTOM LAB</span>
            </a>
          </div>

          <!-- CHAMPION BUNDLE -->
          <div class="rdx-nav-item">
            <a href="#kit-builder" class="rdx-nav-link rdx-sale-link">
              <span>🏆 CHAMPION BUNDLE (-18%)</span>
            </a>
          </div>

          <!-- GIFT CARD -->
          <div class="rdx-nav-item">
            <a href="#armory" class="rdx-nav-link rdx-giftcard-link">
              <span>🎁 GIFT CARD</span>
            </a>
          </div>
        </nav>

        <!-- RIGHT UTILITY ACTIONS -->
        <div class="rdx-utility-actions">
          <!-- Country / Currency Selector -->
          <div class="rdx-country-selector" id="rdx-country-dropdown">
            <button class="rdx-country-btn" id="country-btn" aria-label="Select Country">
              <span class="flag-icon">🇺🇸</span>
              <span class="country-code">USD</span>
              <svg class="chevron-icon" viewBox="0 0 10 6" width="8" height="5"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            </button>
            <div class="country-dropdown-menu" id="country-menu">
              <button class="country-option active" data-cur="USD" data-flag="🇺🇸">🇺🇸 United States (USD $)</button>
              <button class="country-option" data-cur="GBP" data-flag="🇬🇧">🇬🇧 United Kingdom (GBP £)</button>
              <button class="country-option" data-cur="EUR" data-flag="🇪🇺">🇪🇺 European Union (EUR €)</button>
              <button class="country-option" data-cur="CAD" data-flag="🇨🇦">🇨🇦 Canada (CAD $)</button>
              <button class="country-option" data-cur="AUD" data-flag="🇦🇺">🇦🇺 Australia (AUD $)</button>
            </div>
          </div>

          <!-- Search Icon Button -->
          <button class="rdx-util-btn" id="header-search-btn" title="Search Products (Ctrl+K or /)" aria-label="Search">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          <!-- Admin Console Button -->
          <button class="admin-trigger-nav-btn" id="header-admin-btn" title="Open Supabase Tactical Admin Console">
            <span>⚡ ADMIN CONSOLE</span>
          </button>

          <!-- User Account Icon Button -->
          <button class="rdx-util-btn" id="header-account-btn" title="Athlete Account" aria-label="Account">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span id="header-user-status-container" style="display:none; margin-left: 5px; font-family: var(--font-mono); font-size: 0.7rem; color: #ffd700;"></span>
          </button>

          <!-- Audio Haptic Sound Button -->
          <button class="rdx-util-btn" id="audio-toggle-btn" title="Toggle Haptic Audio" aria-label="Toggle Sound">
            <span id="audio-icon" style="font-size: 1.15rem;">🔊</span>
          </button>

          <!-- Shopping Bag Cart Button -->
          <button class="rdx-cart-bag-btn" id="cart-toggle-btn" title="View Cart" aria-label="Shopping Cart">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span class="rdx-cart-badge" id="cart-counter-badge">0</span>
          </button>
        </div>

      </div>
    </header>

    <!-- 2. HERO VIEWPORT: THE APEX SHOWCASE -->
    <section class="hero-section" id="hero">
      <div class="hero-background-grid"></div>
      <div class="container hero-grid-layout">
        <div class="hero-content">
          <div class="hero-badge-row">
            <span class="mono-tag crimson">[ OFFICIAL CHAMPIONSHIP ARMOR ]</span>
            <span class="mono-tag">24K GOLD TITLE BELTS // 450GSM COMBAT HOODIES</span>
          </div>

          <h1 class="hero-headline" id="hero-headline-element">
            ARMOR OF
            <span>CHAMPIONS</span>
          </h1>

          <p class="hero-subhead" id="hero-subhead-element">
            Forged for the apex of combat glory. Featuring CNC 8mm deep-relief 24K gold plates, hand-set cubic zirconia diamond crystals, and 450GSM ultra-dense French Terry fleece.
          </p>

          <div class="hero-cta-group">
            <a href="#armory" class="btn-primary" id="hero-explore-btn">
              <span>EXPLORE TITLE BELTS & HOODIES</span>
              <span>→</span>
            </a>
            <button class="btn-secondary" id="hero-lab-trigger" data-modal="lab">
              <span>THE CRAFTSMANSHIP LAB (SPEC ARCHIVE)</span>
            </button>
          </div>

          <div class="hero-trust-row">
            <div class="trust-item">
              <span class="trust-icon">🏆</span>
              <div>
                <strong>8MM CNC 24K GOLD</strong>
                <small>Deep 3D Sculpted Relief</small>
              </div>
            </div>
            <div class="trust-item">
              <span class="trust-icon">🧥</span>
              <div>
                <strong>450GSM FRENCH TERRY</strong>
                <small>100% Combed Heavy Cotton</small>
              </div>
            </div>
            <div class="trust-item">
              <span class="trust-icon">🛡️</span>
              <div>
                <strong>FULL-GRAIN LEATHER</strong>
                <small>Dual-Row 8-Snap Box</small>
              </div>
            </div>
          </div>
        </div>

        <!-- HERO INTERACTIVE DUAL SHOWCASE STUDIO -->
        <div class="hero-showcase-container" id="hero-showcase-container">
          <div class="hero-showcase-card" id="hero-showcase-card">
            <div class="hero-showcase-img-wrap">
              <img src="/images/hero-dual-showcase.jpg" alt="GENZ Wrestling Title Belt & 450GSM Heavyweight Combat Hoodie" id="hero-showcase-img" class="hero-showcase-img" />
              <div class="hero-glint-beam" id="hero-glint-beam"></div>
            </div>

            <!-- Telemetry HUD Pins -->
            <div class="hud-pin" style="top: 8%; left: 4%;">
              <span class="hud-pin-dot"></span>
              <span>8MM 24K GOLD MAIN PLATE // CNC RELIEF</span>
            </div>
            <div class="hud-pin" style="bottom: 18%; left: 4%;">
              <span class="hud-pin-dot"></span>
              <span>450GSM FRENCH TERRY // COMBED LONG-STAPLE COTTON</span>
            </div>
            <div class="hud-pin" style="top: 24%; right: 4%;">
              <span class="hud-pin-dot"></span>
              <span>4MM FULL-GRAIN SADDLE LEATHER & 8-SNAP BOX</span>
            </div>

            <!-- Showcase Studio Controller -->
            <div class="hero-showcase-controls">
              <div class="hero-mode-group">
                <span class="mono-tag" style="color:#ffd700; font-size:0.68rem;">STUDIO VIEW:</span>
                <button class="hero-mode-pill active" data-mode="dual" data-img="/images/hero-dual-showcase.jpg" title="Dual Belt & Hoodie Apex Showcase">⚡ DUAL APEX</button>
                <button class="hero-mode-pill" data-mode="belt" data-img="/images/belts/world-heavyweight-belt.jpg" title="24K World Heavyweight Title Belt">🏆 24K TITLE BELT</button>
                <button class="hero-mode-pill" data-mode="hoodie" data-img="/images/hoodies/genz-heavyweight-hoodie.jpg" title="450GSM Heavyweight Combat Hoodie">🧥 450GSM HOODIE</button>
              </div>
              <button class="btn-glint-trigger" id="hero-glint-trigger" title="Simulate Arena Light Glint">
                <span>✨ REFLECTION</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. THE CRUCIBLE: BRAND MANIFESTO & METALLURGY -->
    <section class="crucible-section" id="crucible">
      <div class="crucible-watermark">GENZ SPORTS</div>
      <div class="container crucible-grid">
        <div class="crucible-text-block">
          <span class="mono-tag crimson">// THE PHILOSOPHY OF EXCELLENCE</span>
          <h2 class="crucible-quote" id="crucible-quote-element">
            "THE MAT DOES NOT FORGIVE COMPROMISE. WE DO NOT BUILD PLASTIC REPLICAS. <em>WE FORGE CHAMPIONSHIP GOLD & HEAVYWEIGHT COMBAT HOODIES.</em>"
          </h2>
          <p class="crucible-body" id="crucible-body-element">
            Mass-market companies cut corners with hollow zinc plates, cracking vinyl leatherette, and flimsy 260GSM polyester hoodies that lose their shape in three washes. GENZ SPORTS is forged for champions and dedicated combat athletes who demand authentic 8mm 24K gold relief plates, vegetable-tanned saddle leather, and 450GSM combed cotton with lifetime structural integrity.
          </p>
          <div>
            <button class="btn-secondary" id="punch-test-btn" style="padding: 0.8rem 1.6rem;">
              <span>⚡ AUDIT METALLURGY TELEMETRY (AUDIO PUNCH)</span>
            </button>
          </div>
        </div>

        <div class="crucible-stats-grid">
          <div class="crucible-stat-card">
            <span class="stat-number">24<span>K</span></span>
            <span class="mono-tag">DUAL-ELECTROPLATED GOLD</span>
            <p class="mono-tag" style="font-size:0.65rem; color:#777;">Mirror polished 8mm CNC brass relief</p>
          </div>
          <div class="crucible-stat-card">
            <span class="stat-number">450<span>GSM</span></span>
            <span class="mono-tag">FRENCH TERRY COTTON</span>
            <p class="mono-tag" style="font-size:0.65rem; color:#777;">100% Combed heavy long-staple fleece</p>
          </div>
          <div class="crucible-stat-card">
            <span class="stat-number">4.0<span>mm</span></span>
            <span class="mono-tag">FULL-GRAIN SADDLE LEATHER</span>
            <p class="mono-tag" style="font-size:0.65rem; color:#777;">Obsidian wax treated with 8-snap brass box</p>
          </div>
          <div class="crucible-stat-card">
            <span class="stat-number">365<span>D</span></span>
            <span class="mono-tag">REPLACEMENT GUARANTEE</span>
            <p class="mono-tag" style="font-size:0.65rem; color:#777;">Zero-risk gemstone, snap & seam warranty</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. THE ARMORY: PRODUCT CATALOG & ASYMMETRIC GRID -->
    <section class="armory-section" id="armory">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="mono-tag crimson">// COMBAT DEPLOYMENT MATRIX</span>
            <h2 class="section-title">THE ARMORY</h2>
          </div>

          <div class="filter-bar" id="category-filter-bar">
            <button class="filter-tab active" data-cat="all">ALL GEAR</button>
            <button class="filter-tab" data-cat="belts">🏆 TITLE BELTS</button>
            <button class="filter-tab" data-cat="hoodies">🧥 450GSM HOODIES</button>
            <button class="filter-tab" data-cat="accessories">🛡️ ACCESSORIES & MOUNTS</button>
          </div>
        </div>

        <div class="armory-grid" id="product-grid-container">
          <!-- Populated dynamically via renderProducts() -->
        </div>
      </div>
    </section>

    <!-- 5. THE ANATOMY LAB: STRUCTURAL ARCHIVE -->
    <section class="anatomy-lab-section" id="anatomy-lab">
      <div class="container">
        <div style="margin-bottom: 3rem; text-align: center;">
          <span class="mono-tag crimson">// METALLURGY & TEXTILE R&D ARCHIVE</span>
          <h2 class="section-title">THE ANATOMY LAB</h2>
          <p style="color: var(--gzn-slate); max-width: 600px; margin: 0.8rem auto 0;">
            Deconstruct the four proprietary structural tiers of the WWE Undisputed Championship Title Belt and 450GSM French Terry weave.
          </p>
        </div>

        <div class="lab-grid">
          <div class="lab-deconstruct-tabs" id="lab-tabs">
            <div class="lab-tab-item active" data-layer="layer-1">
              <div class="lab-tab-header">
                <span class="lab-tab-title">01. Hand-Crafted Full-Grain Saddle Leather</span>
                <span class="mono-tag crimson">[ 4MM STRAP ]</span>
              </div>
              <p class="lab-tab-desc">
                Anatomically contoured 4mm vegetable-tanned saddle leather treated with hot obsidian wax. Features dual-row 8-snap solid brass closure box, embossed GENZ monogram seal, and polished 24K gold curved belt tip.
              </p>
            </div>

            <div class="lab-tab-item" data-layer="layer-2">
              <div class="lab-tab-header">
                <span class="lab-tab-title">02. Solid CNC 8mm 24K Gold Main Plate</span>
                <span class="mono-tag crimson">[ 24K FOUNDATION ]</span>
              </div>
              <p class="lab-tab-desc">
                Deep-relief CNC sculpted heptagonal center plate featuring hammered stippled gold grain and lower embossed "UNDISPUTED CHAMPION" ribbon with mirror-beveled frame borders.
              </p>
            </div>

            <div class="lab-tab-item" data-layer="layer-3">
              <div class="lab-tab-header">
                <span class="lab-tab-title">03. Hand-Set Cubic Zirconia Diamond Frame</span>
                <span class="mono-tag crimson">[ JEWELRY ARMOR ]</span>
              </div>
              <p class="lab-tab-desc">
                Continuous perimeter of brilliant square-cut diamond crystals with 16 faceted ruby cabochon stones at the apex corners for unmatched light refraction under arena spotlights.
              </p>
            </div>

            <div class="lab-tab-item" data-layer="layer-4">
              <div class="lab-tab-header">
                <span class="lab-tab-title">04. 450GSM Combed French Terry Cotton</span>
                <span class="mono-tag crimson">[ TEXTILE WEAVE ]</span>
              </div>
              <p class="lab-tab-desc">
                Heavyweight 450GSM 100% combed long-staple cotton fleece. Engineered with drop-shoulder athletic cut, double-layer structured hood, and 24K gold dipped drawcord aglets.
              </p>
            </div>
          </div>

          <div style="background: var(--gzn-void); border: 1px solid var(--gzn-border); border-radius: var(--radius-md); padding: 2.5rem;">
            <div style="position: relative; width: 100%; height: 260px; overflow: hidden; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
              <img src="/images/belts/world-heavyweight-belt.jpg" alt="Championship Belt Macro Detail" style="width: 100%; height: 100%; object-fit: cover;" />
              <div style="position: absolute; bottom: 1rem; left: 1rem; background: rgba(10,10,12,0.85); padding: 0.3rem 0.6rem; border: 1px solid var(--gzn-border); font-family: var(--font-mono); font-size: 0.72rem;">
                MICROSCOPIC CROSS-SECTION // 8MM 24K GOLD RELIEF
              </div>
            </div>

            <div class="lab-metrics-panel">
              <div class="lab-metric-card">
                <div class="metric-value">24K Gold</div>
                <div class="metric-label">Dual-Electroplated</div>
              </div>
              <div class="lab-metric-card">
                <div class="metric-value">8 mm</div>
                <div class="metric-label">CNC Plate Relief</div>
              </div>
              <div class="lab-metric-card">
                <div class="metric-value">450 GSM</div>
                <div class="metric-label">French Terry Cotton</div>
              </div>
            </div>

            <div style="margin-top: 1.8rem;">
              <button class="btn-primary" id="lab-quick-arm-btn" style="width: 100%;">
                <span>ACQUIRE UNDISPUTED TITLE BELT ($499.00)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. THE GZN STANDARD: EMPIRICAL BENCHMARK TABLE -->
    <section class="standard-section" id="standard">
      <div class="container">
        <div style="margin-bottom: 3.5rem;">
          <span class="mono-tag crimson">// EMPIRICAL SPECIFICATION AUDIT</span>
          <h2 class="section-title">THE GENZ STANDARD VS COMMODITY REPLICAS</h2>
          <p style="color: var(--gzn-slate); max-width: 620px; margin-top: 0.8rem;">
            See why wrestling promotions, title collectors, and combat athletes refuse to settle for hollow zinc belts or cheap polyester hoodies.
          </p>
        </div>

        <div class="comparison-table-wrap">
          <table class="comparison-table" aria-label="Comparison Table">
            <thead>
              <tr>
                <th>ENGINEERING BENCHMARK</th>
                <th>COMMODITY REPLICAS & HOODIES</th>
                <th class="highlight-col">★ GENZ SPORTS FLAGSHIP SPEC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="comparison-feature-name">Belt Main Plate Metallurgy</div>
                  <div class="comparison-feature-sub">Thickness, depth, and gold finish</div>
                </td>
                <td>2mm Hollow Zinc Alloy (Dents & scratches, dull yellow tint)</td>
                <td class="highlight-col">
                  <span class="gzn-badge-check">✓ Solid CNC 8mm Deep-Relief 24K Dual-Plated Brass</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="comparison-feature-name">Strap Substrate & Snaps</div>
                  <div class="comparison-feature-sub">Tensile tear and longevity</div>
                </td>
                <td>Synthetic PU or Split Vinyl (Cracks & peels in 3 months)</td>
                <td class="highlight-col">
                  <span class="gzn-badge-check">✓ 4mm Handcrafted Full-Grain Saddle Leather + Dual-Row 8-Snap Box</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="comparison-feature-name">Hoodie Fleece Density & Weight</div>
                  <div class="comparison-feature-sub">Fabric drape, warmth, and wash longevity</div>
                </td>
                <td>260–280 GSM Polyester Blend (Pills & loses shape rapidly)</td>
                <td class="highlight-col">
                  <span class="gzn-badge-check">✓ 450 GSM 100% Combed Long-Staple French Terry Cotton</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="comparison-feature-name">Hardware & Aglets</div>
                  <div class="comparison-feature-sub">Drawstring aglets and snap screws</div>
                </td>
                <td>Hollow Plastic Aglets & Aluminum Screws</td>
                <td class="highlight-col">
                  <span class="gzn-badge-check">✓ 24K Gold Dipped Solid Metal Aglets & Heavy Brass Screws</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="comparison-feature-name">Championship Guarantee</div>
                  <div class="comparison-feature-sub">Warranty and replacement policy</div>
                </td>
                <td>30 Days Limited</td>
                <td class="highlight-col">
                  <span class="gzn-badge-check">✓ 365-Day Unconditional Strike & Snap Replacement Warranty</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 7. THE FIGHT DOSSIER: ATHLETE SOCIAL PROOF -->
    <section class="dossier-section" id="dossier">
      <div class="container">
        <div style="margin-bottom: 3.5rem;">
          <span class="mono-tag crimson">// VERIFIED CHAMPION TELEMETRY</span>
          <h2 class="section-title">THE CHAMPION DOSSIER</h2>
          <p style="color: var(--gzn-slate); max-width: 600px; margin-top: 0.8rem;">
            Direct telemetry from professional wrestling champions and combat streetwear collectors testing GENZ armor.
          </p>
        </div>

        <div class="dossier-grid">
          <div class="dossier-card">
            <div class="dossier-media">
              <img src="/images/belts/world-heavyweight-belt.jpg" alt="Marcus Vance Heavyweight Champion" />
              <div class="dossier-tag">PRO WRESTLING HEAVYWEIGHT // 22-1</div>
            </div>
            <div class="dossier-content">
              <p class="dossier-quote">
                "The 8mm plate depth and mirror-polished 24K gold on this World Heavyweight belt blew our promotion away. The saddle leather strap drapes over the shoulder with genuine heavyweight prestige."
              </p>
              <div class="dossier-fighter-meta">
                <div>
                  <div class="fighter-name">Marcus "Titan" Vance</div>
                  <div class="fighter-gym">Apex Pro Wrestling Federation</div>
                </div>
                <button class="hud-icon-btn audio-preview-btn" data-fighter="Marcus" style="font-size:0.7rem;">
                  <span>▶ PLAY AUDIO (12s)</span>
                </button>
              </div>
            </div>
          </div>

          <div class="dossier-card">
            <div class="dossier-media">
              <img src="/images/hoodies/genz-heavyweight-hoodie.jpg" alt="Jaxson Rivera Combat Athlete" />
              <div class="dossier-tag">COMBAT STREETWEAR // DESIGN DIRECTOR</div>
            </div>
            <div class="dossier-content">
              <p class="dossier-quote">
                "This 450GSM French Terry hoodie has the most insane weight and drape of anything in my collection. The 24K gold dipped aglets and double-layer hood give it an unmistakable luxury presence."
              </p>
              <div class="dossier-fighter-meta">
                <div>
                  <div class="fighter-name">Jaxson Rivera</div>
                  <div class="fighter-gym">Iron Clan Fight Athletics</div>
                </div>
                <button class="hud-icon-btn audio-preview-btn" data-fighter="Jaxson" style="font-size:0.7rem;">
                  <span>▶ PLAY AUDIO (14s)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. ASSEMBLE YOUR ARMOR: THE CHAMPION'S BUNDLE -->
    <section class="kit-builder-section" id="kit-builder">
      <div class="container">
        <div class="kit-builder-card">
          <div>
            <span class="mono-tag crimson">// BUNDLE & SAVE 18%</span>
            <h2 class="section-title" style="margin: 0.5rem 0 1rem;">THE CHAMPION'S BUNDLE</h2>
            <p style="color: var(--gzn-slate); margin-bottom: 2rem;">
              Equip the official Undisputed Championship Title Belt, the Apex 450GSM Combat Hoodie, and Heavy-Duty Wall Mount in one synchronized dispatch and save $115.
            </p>

            <div class="kit-step-list">
              <div class="kit-step-item selected" id="kit-item-1">
                <div>
                  <span class="mono-tag crimson">STEP 01: 24K TITLE BELT</span>
                  <div style="font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; margin-top: 0.2rem;">
                    WWE Undisputed Championship Replica
                  </div>
                </div>
                <div style="font-family: var(--font-mono); font-weight: 700;">$499.00</div>
              </div>

              <div class="kit-step-item selected" id="kit-item-2">
                <div>
                  <span class="mono-tag crimson">STEP 02: 450GSM HEAVYWEIGHT HOODIE</span>
                  <div style="font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; margin-top: 0.2rem;">
                    GENZ Apex 450GSM French Terry Hoodie (L)
                  </div>
                </div>
                <div style="font-family: var(--font-mono); font-weight: 700;">$120.00</div>
              </div>

              <div class="kit-step-item selected" id="kit-item-3">
                <div>
                  <span class="mono-tag crimson">STEP 03: STEEL ARMORY WALL MOUNT</span>
                  <div style="font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; margin-top: 0.2rem;">
                    Heavy-Duty Laser-Cut Steel Belt Mount
                  </div>
                </div>
                <div style="font-family: var(--font-mono); font-weight: 700;">$45.00</div>
              </div>
            </div>
          </div>

          <div class="kit-summary-box">
            <span class="mono-tag">// BUNDLE DISPATCH SUMMARY</span>
            <div class="pricing-row">
              <span style="color: var(--gzn-slate);">INDIVIDUAL VALUE:</span>
              <span style="font-family: var(--font-mono); text-decoration: line-through; color: var(--gzn-slate);">$664.00</span>
            </div>
            <div class="pricing-row">
              <span style="color: var(--gzn-titanium); font-weight: 700;">BUNDLE SAVINGS:</span>
              <span class="discount-badge">-18% (SAVE $115.00)</span>
            </div>
            <div class="pricing-row" style="border-top: 1px solid var(--gzn-border); padding-top: 1rem;">
              <span style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;">TOTAL BUNDLE:</span>
              <span style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: #ffd700;">$549.00</span>
            </div>

            <button class="btn-primary" id="claim-bundle-btn" style="width: 100%; margin-top: 1rem;">
              <span>CLAIM CHAMPION'S BUNDLE ($549.00)</span>
            </button>
            <span class="mono-tag" style="text-align: center; font-size: 0.68rem;">✓ FREE PRIORITY AIR DISPATCH & ARMORED PACKAGING</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 9. THE TERMINAL: CLOSING CONVERSION CLIMAX -->
    <section class="terminal-section" id="terminal">
      <div class="container">
        <div class="terminal-content">
          <span class="mono-tag crimson">[ THE FINAL COMMAND ]</span>
          <h2 class="terminal-title">
            WEAR THE GOLD.<br />
            <span>COMMAND THE STREETS.</span>
          </h2>
          <p style="color: var(--gzn-slate); font-size: 1.15rem; max-width: 600px; line-height: 1.6;">
            Elevate your collection with 24K gold championship glory and 450GSM luxury combat fleece. Step into the GENZ ecosystem now.
          </p>

          <a href="#armory" class="btn-primary" style="padding: 1.2rem 3rem; font-size: 0.95rem;">
            <span>ENTER ARMORY & ACQUIRE GOLD</span>
            <span>→</span>
          </a>

          <div class="terminal-guarantees">
            <div class="guarantee-item">
              <span style="color: var(--gzn-crimson);">✓</span>
              <span>365-DAY STRIKE & SNAP WARRANTY</span>
            </div>
            <div class="guarantee-item">
              <span style="color: var(--gzn-crimson);">✓</span>
              <span>WORLDWIDE PRIORITY AIR DISPATCH</span>
            </div>
            <div class="guarantee-item">
              <span style="color: var(--gzn-crimson);">✓</span>
              <span>FREE 30-DAY HASSLE-FREE RETURNS</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 10. FOOTER -->
    <footer class="gzn-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand-col">
            <img src="/images/genz-3d-logo.png" alt="GENZ SPORTS" class="genz-footer-logo" />
            <p style="color: var(--gzn-slate); font-size: 0.9rem; line-height: 1.6; max-width: 320px;">
              Handcrafted 24K dual-plated wrestling championship title belts and 450GSM luxury combat streetwear hoodies forged for modern champions.
            </p>
            <span class="mono-tag" style="margin-top: 0.5rem;">CAGE CODE: #GENZ-984-COMBAT</span>
          </div>

          <div>
            <h4 class="footer-col-title">ARMORY</h4>
            <ul class="footer-links">
              <li><a href="#armory" data-cat="belts">Undisputed Title Belt</a></li>
              <li><a href="#armory" data-cat="belts">World Heavyweight "Big Gold"</a></li>
              <li><a href="#armory" data-cat="belts">Intercontinental Belt</a></li>
              <li><a href="#armory" data-cat="hoodies">Apex 450GSM Hoodie</a></li>
              <li><a href="#armory" data-cat="hoodies">Raw-Cut Vintage Hoodie</a></li>
              <li><a href="#armory" data-cat="accessories">Belt Wall Mounts & Cases</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-col-title">TECHNOLOGY</h4>
            <ul class="footer-links">
              <li><a href="#anatomy-lab">The Anatomy Lab</a></li>
              <li><a href="#standard">The GENZ Standard</a></li>
              <li><a href="#dossier">Champion Dossier</a></li>
              <li><a href="#" data-modal="why">365-Day Guarantee</a></li>
              <li><a href="#" data-modal="faq">Dispatch & Sizing Terminal</a></li>
            </ul>
          </div>

          <div class="footer-newsletter">
            <h4 class="footer-col-title">CHAMPION DISPATCH</h4>
            <p style="color: var(--gzn-slate); font-size: 0.85rem; margin-bottom: 1rem;">
              Receive confidential title belt release drops, exclusive promo codes, and 450GSM textile telemetry.
            </p>
            <form id="newsletter-form">
              <input type="email" id="newsletter-email" placeholder="ENTER YOUR ATHLETE EMAIL" required />
              <button type="submit" class="btn-primary" style="width: 100%; padding: 0.8rem;">
                <span>SUBSCRIBE TO DISPATCH</span>
              </button>
            </form>
          </div>
        </div>

        <div class="footer-bottom">
          <span class="mono-tag">© 2026 GENZ SPORTS. ALL RIGHTS RESERVED. FORGED FOR CHAMPIONS.</span>
          <div style="display: flex; gap: 1.5rem;">
            <a href="#" class="mono-tag policy-link" data-policy="Privacy Policy" style="text-decoration: none;">PRIVACY POLICY</a>
            <a href="#" class="mono-tag policy-link" data-policy="Terms of Engagement" style="text-decoration: none;">TERMS OF ENGAGEMENT</a>
            <a href="#" class="mono-tag policy-link" data-policy="Security Compliance" style="text-decoration: none;">SECURITY COMPLIANCE</a>
          </div>
        </div>
      </div>
    </footer>

    <!-- 11. TACTICAL SLIDEOUT CART DRAWER -->
    <div class="cart-overlay" id="cart-overlay"></div>
    <aside class="cart-drawer" id="cart-drawer" aria-label="Tactical Armory Bag">
      <div class="cart-drawer-header">
        <div>
          <span class="mono-tag crimson">[ COMBAT DISPATCH ]</span>
          <h3 class="cart-title">TACTICAL BAG</h3>
        </div>
        <button class="cart-close-btn" id="cart-close-btn" aria-label="Close Cart">✕</button>
      </div>

      <div class="shipping-meter" id="shipping-meter">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="mono-tag" id="shipping-status-text">FREE DISPATCH UNLOCK</span>
          <span class="mono-tag crimson" id="shipping-percent-text">0%</span>
        </div>
        <div class="meter-track">
          <div class="meter-fill" id="shipping-meter-fill" style="width: 0%;"></div>
        </div>
      </div>

      <div class="cart-items-scroll" id="cart-items-container">
        <!-- Rendered dynamically -->
      </div>

      <!-- PROMO CODE INPUT SECTION -->
      <div class="cart-promo-section">
        <div class="cart-promo-form">
          <input type="text" id="cart-promo-input" placeholder="PROMO CODE (e.g. CHAMPION10)" />
          <button id="cart-promo-btn" class="btn-promo-apply">APPLY</button>
        </div>
        <div id="cart-promo-status" class="cart-promo-status"></div>
      </div>

      <div class="cart-drawer-footer">
        <div class="cart-totals-breakdown">
          <div class="totals-row">
            <span>SUBTOTAL:</span>
            <span id="cart-subtotal-price">$0.00</span>
          </div>
          <div class="totals-row discount-row" id="cart-discount-row" style="display:none; color: #27c93f;">
            <span id="cart-discount-label">PROMO DISCOUNT:</span>
            <span id="cart-discount-amount">-$0.00</span>
          </div>
          <div class="totals-row" style="border-top:1px solid var(--gzn-border); padding-top:0.6rem; font-weight:700;">
            <span style="font-family: var(--font-display); font-size: 1.15rem; color: var(--gzn-titanium);">TOTAL:</span>
            <span id="cart-total-price" style="font-size:1.35rem; color:#ffd700;">$0.00</span>
          </div>
        </div>

        <button class="btn-primary" id="checkout-btn" style="width: 100%; padding: 1.1rem;">
          <span>PROCEED TO TACTICAL CHECKOUT</span>
          <span>→</span>
        </button>

        <div style="display: flex; justify-content: center; gap: 1rem; opacity: 0.6; margin-top: 0.5rem;">
          <span class="mono-tag" style="font-size: 0.65rem;">APPLE PAY</span>
          <span class="mono-tag" style="font-size: 0.65rem;">SHOP PAY</span>
          <span class="mono-tag" style="font-size: 0.65rem;">KLARNA 4X</span>
        </div>
      </div>
    </aside>

    <!-- 12. QUICK VIEW / INSPECT MODAL -->
    <div class="modal-overlay" id="quick-view-modal">
      <div class="modal-content" id="quick-view-content">
        <!-- Injected dynamically on click -->
      </div>
    </div>
  `;

  renderProducts();
}

// Render product catalog
function renderProducts() {
  const container = document.getElementById('product-grid-container');
  if (!container) return;

  const filtered = currentCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === currentCategory);

  container.innerHTML = filtered.map(product => `
    <article class="gzn-product-card" data-id="${product.id}">
      <div class="card-image-wrap">
        <img src="${product.image}" alt="${product.title}" loading="lazy" />
        <span class="card-tag-badge">${product.tag}</span>
        <button class="card-quick-inspect-btn quick-inspect-trigger" data-id="${product.id}" title="Quick Inspect">
          🔍
        </button>
      </div>

      <div class="card-info">
        <div class="card-title-row">
          <h3 class="card-title">${product.title}</h3>
          <span class="card-price">${store.formatPrice(product.price)}</span>
        </div>

        <p class="card-desc">${product.description}</p>

        <div class="card-size-selector" data-id="${product.id}">
          <span class="mono-tag" style="margin-right: 0.3rem;">SIZE:</span>
          ${(Array.isArray(product.sizes) ? product.sizes : [product.defaultSize || 'STANDARD']).map((s, idx) => `
            <button class="size-pill ${idx === 0 ? 'active' : ''}" data-size="${s}">${s}</button>
          `).join('')}
        </div>

        <button class="btn-primary card-add-btn add-to-cart-trigger" data-id="${product.id}">
          <span>ARMOR UP (+ ${store.formatPrice(product.price)})</span>
        </button>
      </div>
    </article>
  `).join('');

  attachCardEvents();
}

function attachCardEvents() {
  // Size selection on product cards
  document.querySelectorAll('.card-size-selector .size-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = e.target.closest('.card-size-selector');
      parent.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      playMetallicClick();
    });
  });

  // Add to cart click
  document.querySelectorAll('.add-to-cart-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.gzn-product-card');
      const productId = card.getAttribute('data-id');
      const activeSizePill = card.querySelector('.size-pill.active');
      const chosenSize = activeSizePill ? activeSizePill.getAttribute('data-size') : null;

      // Button state feedback
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span>DISPATCHING...</span>`;
      btn.style.background = '#27c93f';

      setTimeout(() => {
        store.addToCart(productId, chosenSize);
        btn.innerHTML = `<span>ARMORED ✓</span>`;

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          openCart();
        }, 350);
      }, 250);
    });
  });

  // Quick inspect modal
  document.querySelectorAll('.quick-inspect-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.getAttribute('data-id');
      openQuickView(productId);
    });
  });
}

function setupEventListeners() {
  // Category tabs filter
  document.querySelectorAll('#category-filter-bar .filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('#category-filter-bar .filter-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-cat');
      playMetallicClick();
      renderProducts();
    });
  });

  // Header Nav & Mega Menu quick jump filters
  document.querySelectorAll('.rdx-nav-link, .mega-link, .footer-links a[data-cat]').forEach(link => {
    link.addEventListener('click', (e) => {
      const cat = link.getAttribute('data-cat');
      if (cat) {
        currentCategory = cat;
        document.querySelectorAll('#category-filter-bar .filter-tab').forEach(t => {
          t.classList.toggle('active', t.getAttribute('data-cat') === cat);
        });
        renderProducts();
        playMetallicClick();
      }
    });
  });

  // Country / Currency Selector Dropdown
  const countryBtn = document.getElementById('country-btn');
  const countryMenu = document.getElementById('country-menu');
  if (countryBtn && countryMenu) {
    countryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      countryMenu.classList.toggle('open');
      playMetallicClick();
    });

    document.querySelectorAll('.country-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        document.querySelectorAll('.country-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const code = opt.getAttribute('data-cur');
        const flag = opt.getAttribute('data-flag');
        const codeEl = document.querySelector('.country-code');
        const flagEl = document.querySelector('.flag-icon');
        if (codeEl) codeEl.textContent = code;
        if (flagEl) flagEl.textContent = flag;
        countryMenu.classList.remove('open');
        store.setCurrency(code);
        renderProducts();
        updateCartUI();
        showNotificationToast(`Currency switched to ${code}`, 'info');
        playMetallicClick();
      });
    });

    window.addEventListener('click', () => {
      countryMenu.classList.remove('open');
    });
  }

  // Header Search Trigger: Opens Interactive Tactical Search Palette Modal
  const searchBtn = document.getElementById('header-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      playMetallicClick();
      openSearchModal();
    });
  }

  // Hero Dual Showcase Studio Mode Selector
  document.querySelectorAll('.hero-mode-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.hero-mode-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const imgPath = pill.getAttribute('data-img');
      const imgEl = document.getElementById('hero-showcase-img');
      if (imgEl && imgPath) {
        imgEl.style.opacity = '0.4';
        imgEl.style.transform = 'scale(0.97)';
        setTimeout(() => {
          imgEl.src = imgPath;
          imgEl.style.opacity = '1';
          imgEl.style.transform = 'scale(1)';
        }, 150);
      }

      // Trigger glint beam on switch
      const beam = document.getElementById('hero-glint-beam');
      if (beam) {
        beam.classList.remove('glint-active');
        void beam.offsetWidth;
        beam.classList.add('glint-active');
      }
      playPunchImpact();
    });
  });

  // Hero Showcase 3D Perspective Tilt on Mouse Movement
  const showcaseCard = document.getElementById('hero-showcase-card');
  if (showcaseCard) {
    showcaseCard.addEventListener('mousemove', (e) => {
      const rect = showcaseCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      showcaseCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    showcaseCard.addEventListener('mouseleave', () => {
      showcaseCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  // Hero Glint Beam Trigger
  const glintBtn = document.getElementById('hero-glint-trigger');
  const glintBeam = document.getElementById('hero-glint-beam');
  if (glintBtn && glintBeam) {
    glintBtn.addEventListener('click', () => {
      glintBeam.classList.remove('glint-active');
      void glintBeam.offsetWidth;
      glintBeam.classList.add('glint-active');
      playMetallicClick();
    });
  }

  // Hero Lab trigger button
  document.getElementById('hero-lab-trigger')?.addEventListener('click', () => {
    openModal('lab-modal');
  });

  // Header Admin Console Trigger
  const adminBtn = document.getElementById('header-admin-btn');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      openAdminPanel();
    });
  }

  // Header Account Trigger
  const accountBtn = document.getElementById('header-account-btn');
  if (accountBtn) {
    accountBtn.addEventListener('click', () => {
      playMetallicClick();
      openAuthModal();
    });
  }

  // Audio Toggle
  const audioBtn = document.getElementById('audio-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const enabled = toggleSound();
      const icon = document.getElementById('audio-icon');
      if (icon) icon.textContent = enabled ? '🔊' : '🔇';
    });
  }

  // Audio Punch Test in Crucible
  const punchTestBtn = document.getElementById('punch-test-btn');
  if (punchTestBtn) {
    punchTestBtn.addEventListener('click', () => {
      playPunchImpact();
    });
  }

  // Fighter Audio Previews
  document.querySelectorAll('.audio-preview-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playPunchImpact();
      const original = btn.innerHTML;
      btn.innerHTML = '<span>🔊 PLAYING TESTIMONY...</span>';
      setTimeout(() => {
        btn.innerHTML = original;
      }, 2000);
    });
  });

  // Anatomy Lab Layer Tabs
  document.querySelectorAll('#lab-tabs .lab-tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#lab-tabs .lab-tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      playMetallicClick();
    });
  });

  // Lab Quick Arm
  const labArmBtn = document.getElementById('lab-quick-arm-btn');
  if (labArmBtn) {
    labArmBtn.addEventListener('click', () => {
      store.addToCart('genz-undisputed-belt', 'OFFICIAL REPLICA');
      openCart();
    });
  }

  // Champion's Bundle Claim Button
  const bundleBtn = document.getElementById('claim-bundle-btn');
  if (bundleBtn) {
    bundleBtn.addEventListener('click', () => {
      store.addToCart('genz-undisputed-belt', 'OFFICIAL REPLICA');
      store.addToCart('genz-hoodie-heavyweight-450', 'L');
      store.addToCart('genz-belt-wall-mount', 'STANDARD SINGLE MOUNT');
      playPunchImpact();
      showNotificationToast("🏆 Champion's Bundle dispatched to Armory bag (Saved $115)!", 'success');
      openCart();
    });
  }

  // Cart Promo Code Application
  const promoBtn = document.getElementById('cart-promo-btn');
  const promoInput = document.getElementById('cart-promo-input');
  const promoStatus = document.getElementById('cart-promo-status');
  if (promoBtn && promoInput) {
    promoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim();
      if (!code) return;
      const res = store.applyPromoCode(code);
      if (res.success) {
        if (promoStatus) promoStatus.innerHTML = `<span style="color:#27c93f;">✓ ${res.message}</span>`;
        playPunchImpact();
        showNotificationToast(res.message, 'success');
      } else {
        if (promoStatus) promoStatus.innerHTML = `<span style="color:var(--gzn-crimson);">✕ ${res.message}</span>`;
        playMetallicClick();
      }
      updateCartUI();
    });

    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        promoBtn.click();
      }
    });
  }

  // Newsletter Submission
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email')?.value;
      playPunchImpact();
      showNotificationToast(`🛡️ Subscribed ${email} to GENZ Champion Dispatch!`, 'success');
      newsletterForm.reset();
    });
  }

  // Policy modal triggers
  document.querySelectorAll('.policy-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const policy = link.getAttribute('data-policy') || 'Terms of Engagement';
      const titleEl = document.getElementById('legal-modal-title');
      if (titleEl) titleEl.textContent = policy.toUpperCase();
      openModal('legal-modal');
    });
  });

  // Cart Drawer open/close triggers
  document.getElementById('cart-toggle-btn')?.addEventListener('click', openCart);
  document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  // Checkout Button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      if (store.getCartCount() === 0) {
        alert('Your tactical bag is currently empty. Select title belts or hoodies from the Armory.');
        return;
      }

      playPunchImpact();
      checkoutBtn.disabled = true;
      const originalText = checkoutBtn.innerHTML;
      checkoutBtn.innerHTML = `<span>DISPATCHING ORDER TO SUPABASE...</span>`;

      try {
        const user = await auth.getUser();
        const customerEmail = user?.email || 'champion.guest@gznsports.internal';
        const subtotal = store.getCartSubtotal();
        const total = store.getCartTotal();

        const orderData = {
          customer_name: customerEmail.split('@')[0].toUpperCase(),
          customer_email: customerEmail,
          subtotal: subtotal,
          total: total,
          status: 'PROCESSING',
          payment_status: 'PAID',
          items: [...store.cart],
          shipping_address: {
            method: 'Priority Armored Air Dispatch',
            destination: 'Direct Champion Delivery'
          }
        };

        const createdOrder = await adminApi.createOrder(orderData);
        
        playPunchImpact();
        store.clearCart();
        closeCart();

        const orderShortId = (createdOrder.id || 'CONFIRMED').slice(0, 8).toUpperCase();
        showNotificationToast(`🛡️ ORDER RECORDED IN SUPABASE #${orderShortId}`, 'success');
        alert(`⚡ GENZ COMBAT DISPATCH INITIALIZED\n\nOrder Ref: #${orderShortId}\nPayment Status: VERIFIED & PAID\nItems: ${orderData.items.length}\nTotal: ${store.formatPrice(total)}\n\nThank you for choosing GENZ SPORTS.`);
      } catch (err) {
        console.error('Checkout error:', err);
        alert(`Tactical dispatch warning: ${err.message}`);
      } finally {
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = originalText;
      }
    });
  }
}

// Update Cart UI
function updateCartUI() {
  const counter = document.getElementById('cart-counter-badge');
  const itemsContainer = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal-price');
  const discountRow = document.getElementById('cart-discount-row');
  const discountAmountEl = document.getElementById('cart-discount-amount');
  const totalEl = document.getElementById('cart-total-price');
  const meterFill = document.getElementById('shipping-meter-fill');
  const meterPercent = document.getElementById('shipping-percent-text');
  const meterStatus = document.getElementById('shipping-status-text');

  if (counter) {
    const count = store.getCartCount();
    counter.textContent = count;
    counter.classList.toggle('has-items', count > 0);
  }

  const subtotal = store.getCartSubtotal();
  const discount = store.getCartDiscount();
  const total = store.getCartTotal();

  if (subtotalEl) subtotalEl.textContent = store.formatPrice(subtotal);

  if (discountRow && discountAmountEl) {
    if (discount > 0) {
      discountRow.style.display = 'flex';
      discountAmountEl.textContent = `-${store.formatPrice(discount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (totalEl) totalEl.textContent = store.formatPrice(total);

  // Shipping progress
  const shipping = store.getFreeShippingProgress();
  if (meterFill) meterFill.style.width = `${shipping.percent}%`;
  if (meterPercent) meterPercent.textContent = `${shipping.percent}%`;
  if (meterStatus) {
    meterStatus.textContent = shipping.unlocked
      ? 'FREE PRIORITY AIR DISPATCH UNLOCKED! ✓'
      : `ADD ${store.formatPrice(shipping.remaining)} FOR FREE PRIORITY AIR DISPATCH`;
  }

  // Cart Items
  if (itemsContainer) {
    if (store.cart.length === 0) {
      itemsContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--gzn-slate);">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">🏆</div>
          <div style="font-family: var(--font-display); font-size: 1.1rem; color: var(--gzn-titanium); margin-bottom: 0.5rem;">YOUR ARMORY BAG IS EMPTY</div>
          <p class="mono-tag">NO TITLE BELTS OR HOODIES SLOTTED FOR DISPATCH</p>
        </div>
      `;
      return;
    }

    itemsContainer.innerHTML = store.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
        <div>
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-size">SIZE: ${item.size} // ${store.formatPrice(item.price)}</div>
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="window.updateCartQty('${item.id}', '${item.size}', -1)">-</button>
            <span class="mono-tag" style="min-width: 18px; text-align: center;">${item.quantity}</span>
            <button class="qty-btn" onclick="window.updateCartQty('${item.id}', '${item.size}', 1)">+</button>
          </div>
        </div>
        <div>
          <div style="font-family: var(--font-mono); font-weight: 700; margin-bottom: 0.4rem; color: #ffd700;">
            ${store.formatPrice(item.price * item.quantity)}
          </div>
          <button class="mono-tag" style="background:none; border:none; color:var(--gzn-crimson); cursor:pointer; text-decoration:underline;" onclick="window.removeCartItem('${item.id}', '${item.size}')">REMOVE</button>
        </div>
      </div>
    `).join('');
  }
}

// Global Cart Helpers for inline onclicks
window.updateCartQty = (id, size, delta) => {
  store.updateQuantity(id, size, delta);
};

window.removeCartItem = (id, size) => {
  store.removeFromCart(id, size);
};

function openCart() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  playMetallicClick();
}

function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
  playMetallicClick();
}

// Quick View Modal
window.openQuickView = openQuickView;
function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  const content = document.getElementById('quick-view-content');
  if (!modal || !content) return;

  content.innerHTML = `
    <button class="modal-close-btn" id="modal-close-trigger">✕</button>
    <div style="display: grid; grid-template-columns: 1fr 1.1fr; gap: 2.5rem; align-items: center;">
      <div style="height: 340px; border-radius: var(--radius-sm); overflow: hidden; background: var(--gzn-void);">
        <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div>
        <span class="mono-tag crimson">${product.categoryName || product.category.toUpperCase()}</span>
        <h2 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; margin: 0.4rem 0;">${product.title}</h2>
        <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: #ffd700; margin-bottom: 1rem;">
          ${store.formatPrice(product.price)}
        </div>
        <p style="color: var(--gzn-slate); font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.5rem;">${product.description}</p>
        
        <div style="background: var(--gzn-void); border: 1px solid var(--gzn-border); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
          <span class="mono-tag" style="display: block; margin-bottom: 0.5rem;">LAB SPECIFICATIONS:</span>
          ${(product.specs || []).map(s => `
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; padding: 0.25rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span style="color: var(--gzn-slate);">${s.label}:</span>
              <span style="font-family: var(--font-mono); color: var(--gzn-titanium);">${s.value}</span>
            </div>
          `).join('')}
        </div>

        <button class="btn-primary" id="modal-add-btn" style="width: 100%;">
          <span>ADD TO ARMORY (${store.formatPrice(product.price)})</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  playMetallicClick();

  document.getElementById('modal-close-trigger')?.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  document.getElementById('modal-add-btn')?.addEventListener('click', () => {
    store.addToCart(product.id, product.defaultSize);
    modal.classList.remove('open');
    openCart();
  });
}

// Close modal on click outside
window.addEventListener('click', (e) => {
  const modal = document.getElementById('quick-view-modal');
  if (e.target === modal) {
    modal.classList.remove('open');
  }
});

/* ==========================================================================
   SUPABASE BACKEND SYNC & REALTIME AUTO-REFRESH ENGINE
   ========================================================================== */

/**
 * Synchronize product catalog from Supabase via GraphQL Cache Memory / REST API
 */
async function syncCatalogFromBackend(forceFresh = false) {
  try {
    const liveProducts = await adminApi.fetchProducts(forceFresh);
    if (liveProducts && liveProducts.length > 0) {
      store.setProducts(liveProducts);
      renderProducts();
    }
  } catch (err) {
    console.warn('Backend catalog sync fallback to local cache:', err);
  }
}

/**
 * Synchronize site configuration (hero, announcements, manifesto) from Supabase
 */
async function syncSiteSettingsFromBackend() {
  try {
    const settings = await adminApi.fetchSiteSettings();
    applySiteSettings(settings);
  } catch (err) {
    console.warn('Backend site settings sync fallback to defaults:', err);
  }
}

/**
 * Apply live site configuration directly into the DOM with zero browser reload
 */
function applySiteSettings(settings) {
  if (!settings) return;

  // 1. Hero Headline & Subhead
  const heroHeadlineEl = document.getElementById('hero-headline-element');
  const heroSubheadEl = document.getElementById('hero-subhead-element');

  if (settings.hero_config) {
    const hero = settings.hero_config;
    if (heroHeadlineEl) {
      if (hero.headline_top || hero.headline_bottom) {
        const top = hero.headline_top || 'ARMOR OF';
        const bottom = hero.headline_bottom || 'CHAMPIONS';
        heroHeadlineEl.innerHTML = `${top} <span>${bottom}</span>`;
      } else if (hero.headline) {
        const words = hero.headline.trim().split(' ');
        if (words.length > 1) {
          const lastWord = words.pop();
          heroHeadlineEl.innerHTML = `${words.join(' ')} <span>${lastWord}</span>`;
        } else {
          heroHeadlineEl.innerHTML = `<span>${hero.headline}</span>`;
        }
      }
    }
    const subhead = hero.subhead || hero.subtitle;
    if (subhead && heroSubheadEl) {
      heroSubheadEl.textContent = subhead;
    }
  }

  // 2. Announcements Ticker Bar
  const announcementsEl = document.getElementById('announcement-pill-container');
  if (settings.announcements && announcementsEl) {
    const ann = settings.announcements;
    if (Array.isArray(ann.items) && ann.items.length > 0) {
      announcementsEl.innerHTML = ann.items.map((item, idx) => `
        <span>${item}</span>
        ${idx < ann.items.length - 1 ? '<span class="announcement-sep">|</span>' : ''}
      `).join('');
    } else if (ann.banner_text || ann.shipping_text || ann.warranty_text) {
      const parts = [
        ann.banner_text || '⚡ MOVE. IMPROVE. EVOLVE.',
        ann.shipping_text || 'FREE US SHIPPING OVER $50',
        ann.warranty_text || '365-DAY STRIKE WARRANTY'
      ];
      announcementsEl.innerHTML = parts.map((part, idx) => `
        <span>${part}</span>
        ${idx < parts.length - 1 ? '<span class="announcement-sep">|</span>' : ''}
      `).join('');
    }
  }

  // 3. Manifesto Quote & Body
  const quoteEl = document.getElementById('crucible-quote-element');
  const bodyEl = document.getElementById('crucible-body-element');
  if (settings.manifesto) {
    if (settings.manifesto.quote && quoteEl) {
      quoteEl.innerHTML = `"${settings.manifesto.quote}"`;
    }
    if (settings.manifesto.body && bodyEl) {
      bodyEl.textContent = settings.manifesto.body;
    }
  }
}

/**
 * Initialize Supabase Realtime Auto-Refresh Engine
 * Listens for postgres_changes and immediately updates the DOM without page reload!
 */
function initRealtimeAutoRefresh() {
  realtimeEngine.init();

  // Listen for Product updates in Supabase
  realtimeEngine.onProductChange(async (payload) => {
    await syncCatalogFromBackend(true);
    const eventType = payload?.eventType || 'UPDATE';
    showNotificationToast(`⚡ AUTO-REFRESH: Products ${eventType.toLowerCase()}d in Supabase (Zero reload)`, 'info');
  });

  // Listen for Site Settings changes in Supabase
  realtimeEngine.onSettingsChange(async (payload) => {
    const settings = await adminApi.fetchSiteSettings();
    applySiteSettings(settings);
    showNotificationToast(`⚡ AUTO-REFRESH: Site content synchronized live from Supabase`, 'info');
  });

  // Listen for Orders placed in Supabase
  realtimeEngine.onOrderChange((payload) => {
    if (payload?.eventType === 'INSERT') {
      showNotificationToast(`📦 NEW ORDER REGISTERED IN SUPABASE`, 'success');
    }
  });
}

/**
 * Watch Supabase Auth session and reflect in Header UI
 */
function initAuthSessionWatcher() {
  const updateAuthUI = (user) => {
    const statusContainer = document.getElementById('header-user-status-container');
    const accountBtn = document.getElementById('header-account-btn');
    if (!statusContainer || !accountBtn) return;

    if (user && user.email) {
      const handle = user.email.split('@')[0].toUpperCase();
      statusContainer.style.display = 'inline-flex';
      statusContainer.style.alignItems = 'center';
      statusContainer.innerHTML = `<span class="header-user-status-dot"></span>${handle}`;
      accountBtn.setAttribute('title', `Logged in as ${user.email} (Click to manage)`);
    } else {
      statusContainer.style.display = 'none';
      statusContainer.innerHTML = '';
      accountBtn.setAttribute('title', 'Athlete Authentication / Sign In');
    }
  };

  // Check initial session
  auth.getUser().then(user => updateAuthUI(user)).catch(() => {});

  // Subscribe to auth state transitions
  auth.onAuthStateChange((event, session) => {
    const user = session?.user || null;
    updateAuthUI(user);
    if (user && event === 'SIGNED_IN') {
      showNotificationToast(`🛡️ AUTHENTICATED: Welcome ${user.email}`, 'success');
    }
  });
}

/**
 * Global Toast Notification Generator
 */
export function showNotificationToast(message, type = 'info') {
  let container = document.getElementById('gzn-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'gzn-toast-container';
    container.className = 'gzn-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `gzn-toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto dismiss after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 4000);
}
