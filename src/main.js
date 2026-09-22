// GZNSPORTS // MASTER APPLICATION ORCHESTRATOR
import { initCursor } from './cursor.js';
import { Gzn3DEngine } from './gzn3d.js';
import { PRODUCTS, store } from './store.js';
import { toggleSound, isSoundEnabled, playPunchImpact, playMetallicClick } from './audio.js';

let gzn3D = null;
let currentCategory = 'all';

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  initCursor();

  // Initialize 3D Engine in Hero
  const canvasContainer = document.getElementById('hero-3d-canvas-wrap');
  if (canvasContainer) {
    gzn3D = new Gzn3DEngine(canvasContainer);
  }

  // Subscribe to Store changes
  store.subscribe(updateCartUI);

  // Setup Event Handlers
  setupEventListeners();
  updateCartUI();
});

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- 0. TOP ANNOUNCEMENT BAR (RDX ATHLETIC TICKER) -->
    <div class="top-announcement-bar">
      <div class="announcement-inner">
        <div class="announcement-pill">
          <span>⚡ MOVE. IMPROVE. EVOLVE.</span>
          <span class="announcement-sep">|</span>
          <span>FREE US SHIPPING OVER $50</span>
          <span class="announcement-sep">|</span>
          <span>365-DAY STRIKE WARRANTY</span>
        </div>
        <div class="announcement-right-links">
          <a href="#dossier" class="announcement-link">FIGHT LAB</a>
          <span class="announcement-sep">|</span>
          <a href="#standard" class="announcement-link">WHY GZN?</a>
          <span class="announcement-sep">|</span>
          <a href="#terminal" class="announcement-link">HELP / FAQ</a>
        </div>
      </div>
    </div>

    <!-- 1. OFFICIAL RDX-STYLE ATHLETIC HEADER -->
    <header class="rdx-main-header" id="rdx-main-header">
      <div class="rdx-header-inner">
        
        <!-- BRAND LOGO (ANGULAR COMBAT SHIELD) -->
        <a href="#" class="rdx-brand-wrap" aria-label="GZNSPORTS Home">
          <svg class="rdx-brand-emblem" viewBox="0 0 44 44" width="38" height="38" fill="none">
            <path d="M4 6L28 6L38 18L18 40L4 40L18 20L4 20Z" fill="#111111" />
            <path d="M18 6L38 6L28 18L18 18L26 8L18 8Z" fill="#B71234" />
          </svg>
          <div class="rdx-brand-name">
            <span class="brand-core">GZN</span>
            <span class="brand-combat">SPORTS</span>
          </div>
        </a>

        <!-- CENTER NAVIGATION LINKS -->
        <nav class="rdx-nav-menu" aria-label="Primary Navigation">
          <!-- BOXING -->
          <div class="rdx-nav-item has-dropdown">
            <a href="#armory" class="rdx-nav-link" data-cat="striking">
              <span>BOXING</span>
              <svg class="chevron-icon" viewBox="0 0 10 6" width="9" height="5"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            </a>
            <div class="rdx-mega-menu">
              <div class="mega-column">
                <h4 class="mega-heading">GLOVES</h4>
                <a href="#armory" class="mega-link" data-cat="striking">Sparring Gloves (14-16oz)</a>
                <a href="#armory" class="mega-link" data-cat="striking">Bag & Training Gloves</a>
                <a href="#armory" class="mega-link" data-cat="striking">Pro Competition Lace-Up</a>
                <a href="#armory" class="mega-link" data-cat="striking">Inner Glove Gel Wraps</a>
              </div>
              <div class="mega-column">
                <h4 class="mega-heading">PROTECTION</h4>
                <a href="#armory" class="mega-link" data-cat="striking">Armored Headgear</a>
                <a href="#armory" class="mega-link" data-cat="striking">180" Mexican Handwraps</a>
                <a href="#armory" class="mega-link" data-cat="striking">Dual-Density Mouthguards</a>
                <a href="#armory" class="mega-link" data-cat="striking">Groin & Chest Protectors</a>
              </div>
              <div class="mega-column">
                <h4 class="mega-heading">PUNCH BAGS</h4>
                <a href="#armory" class="mega-link" data-cat="bags">150lb Hydro-Core Heavy Bag</a>
                <a href="#armory" class="mega-link" data-cat="bags">Italian Cowhide Speed Bag</a>
                <a href="#armory" class="mega-link" data-cat="bags">Teardrop Angle Bags</a>
                <a href="#armory" class="mega-link" data-cat="bags">Ceiling Anchors & Swivels</a>
              </div>
              <div class="mega-featured">
                <img src="/images/gear-macro.jpg" alt="Featured Glove" />
                <div class="mega-featured-info">
                  <span class="mono-tag" style="color:#b71234;">BEST SELLER</span>
                  <strong>GZN-X1 APEX PRO</strong>
                  <span class="featured-price">$185.00</span>
                  <a href="#armory" class="mega-featured-btn">SHOP NOW →</a>
                </div>
              </div>
            </div>
          </div>

          <!-- MMA -->
          <div class="rdx-nav-item has-dropdown">
            <a href="#armory" class="rdx-nav-link" data-cat="mma">
              <span>MMA</span>
              <svg class="chevron-icon" viewBox="0 0 10 6" width="9" height="5"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            </a>
            <div class="rdx-mega-menu">
              <div class="mega-column">
                <h4 class="mega-heading">MMA GLOVES</h4>
                <a href="#armory" class="mega-link" data-cat="mma">4oz UFC Hybrid Gloves</a>
                <a href="#armory" class="mega-link" data-cat="mma">7oz Sparring Grapple Gloves</a>
                <a href="#armory" class="mega-link" data-cat="mma">Shooto Style Gloves</a>
              </div>
              <div class="mega-column">
                <h4 class="mega-heading">MMA PROTECTION</h4>
                <a href="#armory" class="mega-link" data-cat="mma">Carbon-Flex Shin Armor</a>
                <a href="#armory" class="mega-link" data-cat="mma">High-Density Knee Pads</a>
                <a href="#armory" class="mega-link" data-cat="mma">Ankle Support Sleeves</a>
              </div>
              <div class="mega-featured">
                <img src="/images/mma-athlete.jpg" alt="Featured MMA" />
                <div class="mega-featured-info">
                  <span class="mono-tag" style="color:#b71234;">PRO OCTAGON</span>
                  <strong>STEALTH GRAPPLE 4OZ</strong>
                  <span class="featured-price">$115.00</span>
                  <a href="#armory" class="mega-featured-btn">SHOP NOW →</a>
                </div>
              </div>
            </div>
          </div>

          <!-- FITNESS -->
          <div class="rdx-nav-item has-dropdown">
            <a href="#armory" class="rdx-nav-link" data-cat="bags">
              <span>FITNESS</span>
              <svg class="chevron-icon" viewBox="0 0 10 6" width="9" height="5"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            </a>
            <div class="rdx-mega-menu" style="width: 500px;">
              <div class="mega-column">
                <h4 class="mega-heading">FITNESS GEAR</h4>
                <a href="#armory" class="mega-link" data-cat="bags">Weightlifting Belts</a>
                <a href="#armory" class="mega-link" data-cat="bags">Heavy Jump Ropes</a>
                <a href="#armory" class="mega-link" data-cat="bags">Grip Trainers & Chalk</a>
              </div>
              <div class="mega-column">
                <h4 class="mega-heading">TRAINING BAGS</h4>
                <a href="#armory" class="mega-link" data-cat="bags">150lb Hydro Bag</a>
                <a href="#armory" class="mega-link" data-cat="bags">Speed Bags</a>
              </div>
            </div>
          </div>

          <!-- YOGA -->
          <div class="rdx-nav-item has-dropdown">
            <a href="#armory" class="rdx-nav-link" data-cat="apparel">
              <span>YOGA</span>
              <svg class="chevron-icon" viewBox="0 0 10 6" width="9" height="5"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            </a>
          </div>

          <!-- APPAREL -->
          <div class="rdx-nav-item has-dropdown">
            <a href="#armory" class="rdx-nav-link" data-cat="apparel">
              <span>APPAREL</span>
              <svg class="chevron-icon" viewBox="0 0 10 6" width="9" height="5"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            </a>
          </div>

          <!-- COLLECTIONS -->
          <div class="rdx-nav-item has-dropdown">
            <a href="#kit-builder" class="rdx-nav-link">
              <span>COLLECTIONS</span>
              <svg class="chevron-icon" viewBox="0 0 10 6" width="9" height="5"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            </a>
          </div>

          <!-- KIDS -->
          <div class="rdx-nav-item has-dropdown">
            <a href="#armory" class="rdx-nav-link" data-cat="striking">
              <span>KIDS</span>
              <svg class="chevron-icon" viewBox="0 0 10 6" width="9" height="5"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            </a>
          </div>

          <!-- SALE -->
          <div class="rdx-nav-item">
            <a href="#kit-builder" class="rdx-nav-link rdx-sale-link">
              <span>SALE</span>
            </a>
          </div>

          <!-- GIFT CARD -->
          <div class="rdx-nav-item">
            <a href="#kit-builder" class="rdx-nav-link rdx-giftcard-link">
              <span>🎁 GIFT CARD</span>
            </a>
          </div>
        </nav>

        <!-- RIGHT UTILITY ACTIONS -->
        <div class="rdx-utility-actions">
          <!-- Country Selector -->
          <div class="rdx-country-selector" id="rdx-country-dropdown">
            <button class="rdx-country-btn" id="country-btn" aria-label="Select Country">
              <span class="flag-icon">🇺🇸</span>
              <span class="country-code">US</span>
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
          <button class="rdx-util-btn" id="header-search-btn" title="Search Products" aria-label="Search">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          <!-- User Account Icon Button -->
          <button class="rdx-util-btn" id="header-account-btn" title="Account" aria-label="Account">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
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

    <!-- 2. HERO VIEWPORT: THE THRESHOLD -->
    <section class="hero-section" id="hero">
      <div class="hero-background-grid"></div>
      <div class="container hero-grid-layout">
        <div class="hero-content">
          <div class="hero-badge-row">
            <span class="mono-tag crimson">[ UNDISPUTED CHAMPIONSHIP ARMOR ]</span>
            <span class="mono-tag">SPEC: 24K DUAL-PLATED // FULL-GRAIN LEATHER</span>
          </div>

          <h1 class="hero-headline">
            ARMOR OF
            <span>CHAMPIONS</span>
          </h1>

          <p class="hero-subhead">
            Forged for the apex of combat glory. Featuring CNC 8mm deep-relief 24K gold plates, hand-set cubic zirconia diamond crystals, and authentic dual globe side medallions on handcrafted saddle leather.
          </p>

          <div class="hero-cta-group">
            <a href="#armory" class="btn-primary" id="hero-explore-btn">
              <span>EXPLORE THE ARMORY</span>
              <span>→</span>
            </a>
            <button class="btn-secondary" id="hero-deconstruct-trigger">
              <span>DECONSTRUCT TITLE BELT (3D LAB)</span>
            </button>
          </div>
        </div>

        <div class="hero-canvas-wrapper" id="hero-3d-canvas-wrap">
          <!-- 3D HUD Tooltip Pins -->
          <div class="hud-pin" style="top: 6%; left: 2%;">
            <span class="hud-pin-dot"></span>
            <span>24K GOLD MAIN PLATE // 8MM CNC RELIEF</span>
          </div>
          <div class="hud-pin" style="bottom: 12%; right: 2%;">
            <span class="hud-pin-dot"></span>
            <span>DUAL-ROW HEAVY SNAP BOX & SADDLE LEATHER</span>
          </div>

          <!-- Canvas HUD Controls -->
          <div class="canvas-hud-overlay">
            <div class="hud-mode-group">
              <span class="mono-tag">3D ANIMATION:</span>
              <button class="size-pill" data-mode="showcase" title="Showcase 360 Drift">SHOWCASE 360°</button>
              <button class="size-pill active" data-mode="curved" title="Curved Champion Waist Wrap">WAIST WRAP</button>
              <button class="size-pill" data-mode="flat" title="Flat Exhibition Display">FLAT DISPLAY</button>
            </div>
            <button class="explode-toggle-btn" id="canvas-explode-btn">
              <span>EXPLODE LAYERS</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. THE CRUCIBLE: BRAND MANIFESTO & TENSION -->
    <section class="crucible-section" id="crucible">
      <div class="crucible-watermark">GZNSPORTS</div>
      <div class="container crucible-grid">
        <div class="crucible-text-block">
          <span class="mono-tag crimson">// THE PHILOSOPHY OF IMPACT</span>
          <h2 class="crucible-quote">
            "THE BAG DOES NOT CARE ABOUT EXCUSES. THE RING DOES NOT FORGIVE WEAK WRISTS. WE DO NOT BUILD SPORTING GOODS. <em>WE FORGE COMBAT ARMOR.</em>"
          </h2>
          <p class="crucible-body">
            Mass-market combat brands rely on synthetic split-leather, single-foam molds, and flimsy velcro that collapses within six months. GZNSPORTS was built for fighters who spar five days a week and demand equipment that protects their metacarpals and wrist ligaments at maximum velocity.
          </p>
          <div>
            <button class="btn-secondary" id="punch-test-btn" style="padding: 0.8rem 1.6rem;">
              <span>⚡ TEST IMPACT TELEMETRY (AUDIO PUNCH)</span>
            </button>
          </div>
        </div>

        <div class="crucible-stats-grid">
          <div class="crucible-stat-card">
            <span class="stat-number">99.4<span>%</span></span>
            <span class="mono-tag">FORCE DISSIPATION</span>
            <p class="mono-tag" style="font-size:0.65rem; color:#777;">Tested across 10,000 concussive strikes</p>
          </div>
          <div class="crucible-stat-card">
            <span class="stat-number">1.2<span>mm</span></span>
            <span class="mono-tag">FULL-GRAIN NAPPA</span>
            <p class="mono-tag" style="font-size:0.65rem; color:#777;">Hand-selected top-tier cowhide</p>
          </div>
          <div class="crucible-stat-card">
            <span class="stat-number">365<span>D</span></span>
            <span class="mono-tag">STRIKE GUARANTEE</span>
            <p class="mono-tag" style="font-size:0.65rem; color:#777;">Zero-risk replacement pledge</p>
          </div>
          <div class="crucible-stat-card">
            <span class="stat-number">0.04<span>s</span></span>
            <span class="mono-tag">RECOIL RECOVERY</span>
            <p class="mono-tag" style="font-size:0.65rem; color:#777;">Instant kinetic memory foam</p>
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
            <button class="filter-tab active" data-cat="all">ALL WEAPONRY</button>
            <button class="filter-tab" data-cat="striking">STRIKING</button>
            <button class="filter-tab" data-cat="mma">MMA & HYBRID</button>
            <button class="filter-tab" data-cat="bags">BAGS</button>
            <button class="filter-tab" data-cat="apparel">APPAREL</button>
          </div>
        </div>

        <div class="armory-grid" id="product-grid-container">
          <!-- Populated dynamically via renderProducts() -->
        </div>
      </div>
    </section>

    <!-- 5. THE ANATOMY LAB: INTERACTIVE 3D EXPLODED VIEW -->
    <section class="anatomy-lab-section" id="anatomy-lab">
      <div class="container">
        <div style="margin-bottom: 3rem; text-align: center;">
          <span class="mono-tag crimson">// BIOMECHANICAL R&D ARCHIVE</span>
          <h2 class="section-title">THE ANATOMY LAB</h2>
          <p style="color: var(--gzn-slate); max-width: 600px; margin: 0.8rem auto 0;">
            Deconstruct the four proprietary structural tiers of the WWE Undisputed Championship Title Belt.
          </p>
        </div>

        <div class="lab-grid">
          <div class="lab-deconstruct-tabs" id="lab-tabs">
            <div class="lab-tab-item active" data-layer="layer-1">
              <div class="lab-tab-header">
                <span class="lab-tab-title">01. Hand-Crafted Full-Grain Saddle Leather</span>
                <span class="mono-tag crimson">[ STRAP SUBSTRATE ]</span>
              </div>
              <p class="lab-tab-desc">
                Anatomically contoured 4mm saddle leather treated with obsidian wax. Features dual-row 8-snap gold closure box, embossed WWE monogram crest, and polished gold curved belt tip.
              </p>
            </div>

            <div class="lab-tab-item" data-layer="layer-2">
              <div class="lab-tab-header">
                <span class="lab-tab-title">02. Solid CNC 8mm 24K Gold Main Plate</span>
                <span class="mono-tag crimson">[ 24K FOUNDATION ]</span>
              </div>
              <p class="lab-tab-desc">
                Deep-relief CNC sculpted heptagonal center plate featuring hammered stippled gold grain and lower embossed "UNDISPUTED CHAMPION" ribbon with beveled frame borders.
              </p>
            </div>

            <div class="lab-tab-item" data-layer="layer-3">
              <div class="lab-tab-header">
                <span class="lab-tab-title">03. Hand-Set Cubic Zirconia & Ruby Frame</span>
                <span class="mono-tag crimson">[ JEWELRY ARMOR ]</span>
              </div>
              <p class="lab-tab-desc">
                Continuous perimeter of brilliant square-cut diamond gems with 16 faceted ruby cabochon crystals at the top and bottom corners for unmatched light refraction.
              </p>
            </div>

            <div class="lab-tab-item" data-layer="layer-4">
              <div class="lab-tab-header">
                <span class="lab-tab-title">04. 3D Diamond 'W' & Dual Globe Medallions</span>
                <span class="mono-tag crimson">[ CREST & SIDES ]</span>
              </div>
              <p class="lab-tab-desc">
                Raised diamond-studded center 'W' insignia filled with black faceted gemstones and crimson enamel swoosh, flanked by concentric globe side medallions and polished separator bars.
              </p>
            </div>
          </div>

          <div style="background: var(--gzn-void); border: 1px solid var(--gzn-border); border-radius: var(--radius-md); padding: 2.5rem;">
            <div style="position: relative; width: 100%; height: 260px; overflow: hidden; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
              <img src="/images/gear-macro.jpg" alt="Championship Belt Macro" style="width: 100%; height: 100%; object-fit: cover;" />
              <div style="position: absolute; bottom: 1rem; left: 1rem; background: rgba(10,10,12,0.85); padding: 0.3rem 0.6rem; border: 1px solid var(--gzn-border); font-family: var(--font-mono); font-size: 0.72rem;">
                MICROSCOPIC CROSS-SECTION // 24K GOLD & DIAMOND
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
                <div class="metric-value">1,000+</div>
                <div class="metric-label">Faceted Crystals</div>
              </div>
            </div>

            <div style="margin-top: 1.8rem;">
              <button class="btn-primary" id="lab-quick-arm-btn" style="width: 100%;">
                <span>ACQUIRE UNDISPUTED TITLE BELT ($499)</span>
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
          <h2 class="section-title">THE GZN STANDARD VS COMMODITY GEAR</h2>
          <p style="color: var(--gzn-slate); max-width: 620px; margin-top: 0.8rem;">
            See why pro gyms and combat athletes refuse to settle for mass-market Amazon or RDX equipment.
          </p>
        </div>

        <div class="comparison-table-wrap">
          <table class="comparison-table" aria-label="Comparison Table">
            <thead>
              <tr>
                <th>ENGINEERING BENCHMARK</th>
                <th>COMMODITY GEAR (RDX / STANDARD)</th>
                <th class="highlight-col">★ GZNSPORTS FLAGSHIP SPEC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="comparison-feature-name">Leather Shell Grade</div>
                  <div class="comparison-feature-sub">Tensile tear and sweat resistance</div>
                </td>
                <td>Synthetic PU or Split Leather (Peels in 4-6 mos)</td>
                <td class="highlight-col">
                  <span class="gzn-badge-check">✓ 1.2mm Hand-Selected Full-Grain Nappa</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="comparison-feature-name">Knuckle Shock Dispersion</div>
                  <div class="comparison-feature-sub">Protection for metacarpal bones</div>
                </td>
                <td>Single-Layer Recycled Sponge Foam</td>
                <td class="highlight-col">
                  <span class="gzn-badge-check">✓ Quad-Density IMF + Viscoelastic Cryo-Gel</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="comparison-feature-name">Wrist Stabilization Spine</div>
                  <div class="comparison-feature-sub">Prevention of hyperextension sprains</div>
                </td>
                <td>Single Elastic Velcro Strap (Zero rigid bone lock)</td>
                <td class="highlight-col">
                  <span class="gzn-badge-check">✓ Dual-Spine Carbon-Composite Exoskeleton</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="comparison-feature-name">Microbial & Odor Protection</div>
                  <div class="comparison-feature-sub">Inner lining longevity and hygiene</div>
                </td>
                <td>Basic Tricot Mesh (Accumulates odor permanently)</td>
                <td class="highlight-col">
                  <span class="gzn-badge-check">✓ Silver-Ion SilverThread™ Antimicrobial</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="comparison-feature-name">Combat Guarantee</div>
                  <div class="comparison-feature-sub">Warranty and replacement policy</div>
                </td>
                <td>30 to 60 Days Limited</td>
                <td class="highlight-col">
                  <span class="gzn-badge-check">✓ 365-Day Unconditional Strike Warranty</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 7. THE FIGHT DOSSIER: ATHLETE SOCIAL PROOF & AUDIO -->
    <section class="dossier-section" id="dossier">
      <div class="container">
        <div style="margin-bottom: 3.5rem;">
          <span class="mono-tag crimson">// VERIFIED FIGHT LAB TELEMETRY</span>
          <h2 class="section-title">THE FIGHT DOSSIER</h2>
          <p style="color: var(--gzn-slate); max-width: 600px; margin-top: 0.8rem;">
            Real debriefs from professional fighters and coaches testing GZN weaponry in sparring camps.
          </p>
        </div>

        <div class="dossier-grid">
          <div class="dossier-card">
            <div class="dossier-media">
              <img src="/images/striking-hero.jpg" alt="Alexandre Silva" />
              <div class="dossier-tag">UFC WELTERWEIGHT PRO // 17-3</div>
            </div>
            <div class="dossier-content">
              <p class="dossier-quote">
                "The dual carbon wrist lock on the GZN-X1 is unlike anything in boxing right now. I landed over 80 hard hooks on 150lb bags with zero wrist rolling or knuckle pain."
              </p>
              <div class="dossier-fighter-meta">
                <div>
                  <div class="fighter-name">Alexandre "The Anvil" Silva</div>
                  <div class="fighter-gym">American Kickboxing Academy</div>
                </div>
                <button class="hud-icon-btn audio-preview-btn" data-fighter="Silva" style="font-size:0.7rem;">
                  <span>▶ PLAY AUDIO (12s)</span>
                </button>
              </div>
            </div>
          </div>

          <div class="dossier-card">
            <div class="dossier-media">
              <img src="/images/mma-athlete.jpg" alt="Elena Rostova" />
              <div class="dossier-tag">ONE CHAMPIONSHIP MUAY THAI // 24-2</div>
            </div>
            <div class="dossier-content">
              <p class="dossier-quote">
                "The Cryo-Gel shield absorbs peak strike trauma immediately. When checking heavy kicks or sparring power punchers, the gear gives absolute peace of mind."
              </p>
              <div class="dossier-fighter-meta">
                <div>
                  <div class="fighter-name">Elena Rostova</div>
                  <div class="fighter-gym">Tiger Muay Thai & MMA</div>
                </div>
                <button class="hud-icon-btn audio-preview-btn" data-fighter="Elena" style="font-size:0.7rem;">
                  <span>▶ PLAY AUDIO (14s)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. ASSEMBLE YOUR ARMOR: 3-STEP KIT BUILDER -->
    <section class="kit-builder-section" id="kit-builder">
      <div class="container">
        <div class="kit-builder-card">
          <div>
            <span class="mono-tag crimson">// BUNDLE & SAVE 20%</span>
            <h2 class="section-title" style="margin: 0.5rem 0 1rem;">ASSEMBLE YOUR ARMOR</h2>
            <p style="color: var(--gzn-slate); margin-bottom: 2rem;">
              Complete your three-piece combat striking kit and instantly unlock a 20% discount plus free express flight case packaging.
            </p>

            <div class="kit-step-list">
              <div class="kit-step-item selected" id="kit-item-1">
                <div>
                  <span class="mono-tag crimson">STEP 01: PRO STRIKING GLOVE</span>
                  <div style="font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; margin-top: 0.2rem;">
                    GZN-X1 Apex Pro (16-oz)
                  </div>
                </div>
                <div style="font-family: var(--font-mono); font-weight: 700;">$185.00</div>
              </div>

              <div class="kit-step-item selected" id="kit-item-2">
                <div>
                  <span class="mono-tag crimson">STEP 02: HIGH-TENSION HAND WRAPS</span>
                  <div style="font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; margin-top: 0.2rem;">
                    180" Mexican Weave Wrap System
                  </div>
                </div>
                <div style="font-family: var(--font-mono); font-weight: 700;">$18.00</div>
              </div>

              <div class="kit-step-item selected" id="kit-item-3">
                <div>
                  <span class="mono-tag crimson">STEP 03: TIBIAL DEFENSE SHIELD</span>
                  <div style="font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; margin-top: 0.2rem;">
                    Carbon-Flex Shin Armor (L)
                  </div>
                </div>
                <div style="font-family: var(--font-mono); font-weight: 700;">$130.00</div>
              </div>
            </div>
          </div>

          <div class="kit-summary-box">
            <span class="mono-tag">// BUNDLE DISPATCH SUMMARY</span>
            <div class="pricing-row">
              <span style="color: var(--gzn-slate);">INDIVIDUAL VALUE:</span>
              <span style="font-family: var(--font-mono); text-decoration: line-through; color: var(--gzn-slate);">$333.00</span>
            </div>
            <div class="pricing-row">
              <span style="color: var(--gzn-titanium); font-weight: 700;">BUNDLE SAVINGS:</span>
              <span class="discount-badge">-20% (SAVE $67.00)</span>
            </div>
            <div class="pricing-row" style="border-top: 1px solid var(--gzn-border); padding-top: 1rem;">
              <span style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;">TOTAL KIT:</span>
              <span style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--gzn-crimson);">$266.00</span>
            </div>

            <button class="btn-primary" id="claim-bundle-btn" style="width: 100%; margin-top: 1rem;">
              <span>CLAIM COMPLETE KIT ($266)</span>
            </button>
            <span class="mono-tag" style="text-align: center; font-size: 0.68rem;">✓ FREE EXPRESS DISPATCH & TACTICAL FLIGHT CASE</span>
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
            STOP FIGHTING YOUR GEAR.<br />
            <span>EQUIP YOUR WEAPONRY.</span>
          </h2>
          <p style="color: var(--gzn-slate); font-size: 1.15rem; max-width: 600px; line-height: 1.6;">
            Every day you train with compromised equipment is a day you risk injury and stall progression. Step into the GZN ecosystem now.
          </p>

          <a href="#armory" class="btn-primary" style="padding: 1.2rem 3rem; font-size: 0.95rem;">
            <span>ENTER SHOP & ARMOR UP</span>
            <span>→</span>
          </a>

          <div class="terminal-guarantees">
            <div class="guarantee-item">
              <span style="color: var(--gzn-crimson);">✓</span>
              <span>365-DAY STRIKE WARRANTY</span>
            </div>
            <div class="guarantee-item">
              <span style="color: var(--gzn-crimson);">✓</span>
              <span>SAME-DAY GLOBAL DISPATCH</span>
            </div>
            <div class="guarantee-item">
              <span style="color: var(--gzn-crimson);">✓</span>
              <span>FREE 30-DAY COMBAT RETURNS</span>
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
            <div class="brand-monogram">GZN<span>SPORTS</span></div>
            <p style="color: var(--gzn-slate); font-size: 0.9rem; line-height: 1.6; max-width: 320px;">
              Engineered combat weaponry and high-performance protection forged for those who refuse to compromise in training or battle.
            </p>
            <span class="mono-tag" style="margin-top: 0.5rem;">CAGE CODE: #GZN-984-COMBAT</span>
          </div>

          <div>
            <h4 class="footer-col-title">ARMORY</h4>
            <ul class="footer-links">
              <li><a href="#armory">Boxing Gloves</a></li>
              <li><a href="#armory">MMA & Grappling</a></li>
              <li><a href="#armory">Heavy Strike Bags</a></li>
              <li><a href="#armory">Precision Target Mitts</a></li>
              <li><a href="#armory">Compression Wear</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-col-title">TECHNOLOGY</h4>
            <ul class="footer-links">
              <li><a href="#anatomy-lab">The Anatomy Lab</a></li>
              <li><a href="#standard">The GZN Standard</a></li>
              <li><a href="#dossier">Fighter Dossier</a></li>
              <li><a href="#">365-Day Guarantee</a></li>
              <li><a href="#">Wholesale & Gym Pro</a></li>
            </ul>
          </div>

          <div class="footer-newsletter">
            <h4 class="footer-col-title">FIGHT DISPATCH</h4>
            <p style="color: var(--gzn-slate); font-size: 0.85rem; margin-bottom: 1rem;">
              Receive confidential equipment release drops, fighter camp telemetry, and technical combat analysis.
            </p>
            <form id="newsletter-form" onsubmit="event.preventDefault(); alert('Subscribed to GZN Flight Dispatch.');">
              <input type="email" placeholder="ENTER YOUR ATHLETE EMAIL" required />
              <button class="btn-primary" style="width: 100%; padding: 0.8rem;">
                <span>SUBSCRIBE TO DISPATCH</span>
              </button>
            </form>
          </div>
        </div>

        <div class="footer-bottom">
          <span class="mono-tag">© 2026 GZNSPORTS. ALL RIGHTS RESERVED. ENGINEERED FOR COMBAT.</span>
          <div style="display: flex; gap: 1.5rem;">
            <a href="#" class="mono-tag" style="text-decoration: none;">PRIVACY POLICY</a>
            <a href="#" class="mono-tag" style="text-decoration: none;">TERMS OF ENGAGEMENT</a>
            <a href="#" class="mono-tag" style="text-decoration: none;">SECURITY COMPLIANCE</a>
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

      <div class="cart-drawer-footer">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--gzn-slate); font-family: var(--font-mono); font-size: 0.82rem;">SUBTOTAL:</span>
          <span style="font-family: var(--font-mono); font-size: 1.3rem; font-weight: 700; color: var(--gzn-titanium);" id="cart-subtotal-price">$0.00</span>
        </div>

        <button class="btn-primary" id="checkout-btn" style="width: 100%; padding: 1.1rem;">
          <span>PROCEED TO TACTICAL CHECKOUT</span>
          <span>→</span>
        </button>

        <div style="display: flex; justify-content: center; gap: 1rem; opacity: 0.6; margin-top: 0.2rem;">
          <span class="mono-tag" style="font-size: 0.65rem;">APPLE PAY</span>
          <span class="mono-tag" style="font-size: 0.65rem;">SHOP PAY</span>
          <span class="mono-tag" style="font-size: 0.65rem;">KLARNA 4X</span>
        </div>
      </div>
    </aside>

    <!-- 12. QUICK VIEW / 3D INSPECT MODAL -->
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
          <span class="card-price">$${product.price}</span>
        </div>

        <p class="card-desc">${product.description}</p>

        <div class="card-size-selector" data-id="${product.id}">
          <span class="mono-tag" style="margin-right: 0.3rem;">SIZE:</span>
          ${product.sizes.map((s, idx) => `
            <button class="size-pill ${idx === 0 ? 'active' : ''}" data-size="${s}">${s}</button>
          `).join('')}
        </div>

        <button class="btn-primary card-add-btn add-to-cart-trigger" data-id="${product.id}">
          <span>ARMOR UP (+ $${product.price})</span>
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
  document.querySelectorAll('.rdx-nav-link, .mega-link').forEach(link => {
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
        playMetallicClick();
      });
    });

    window.addEventListener('click', () => {
      countryMenu.classList.remove('open');
    });
  }

  // Header Search Trigger
  const searchBtn = document.getElementById('header-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      playMetallicClick();
      const query = prompt('SEARCH GZN COMBAT WEAPONRY:\nEnter product keyword (e.g. Apex Glove, MMA 4oz, Hydro Bag, Shin):');
      if (query) {
        document.getElementById('armory')?.scrollIntoView({ behavior: 'smooth' });
        const q = query.toLowerCase().trim();
        const match = PRODUCTS.find(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        if (match) {
          currentCategory = match.category;
          document.querySelectorAll('#category-filter-bar .filter-tab').forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-cat') === currentCategory);
          });
          renderProducts();
        } else {
          alert('No specific equipment found matching "' + query + '". Showing all weaponry.');
          currentCategory = 'all';
          document.querySelectorAll('#category-filter-bar .filter-tab').forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-cat') === 'all');
          });
          renderProducts();
        }
      }
    });
  }

  // Header Account Trigger
  const accountBtn = document.getElementById('header-account-btn');
  if (accountBtn) {
    accountBtn.addEventListener('click', () => {
      playMetallicClick();
      alert('⚡ GZN FIGHT LAB // ATHLETE PORTAL\n\nStatus: Member ID #GZN-9844-PRO\nFree Express Dispatch: UNLOCKED\n365-Day Strike Warranty: ACTIVE');
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

  // 3D Canvas Animation Mode Selector (Showcase, Waist Wrap, Flat Display)
  document.querySelectorAll('.hud-mode-group .size-pill, .hud-weight-group .size-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.hud-mode-group .size-pill, .hud-weight-group .size-pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      const mode = e.target.getAttribute('data-mode') || e.target.getAttribute('data-weight');
      if (gzn3D) {
        gzn3D.setMode(mode);
        playPunchImpact();
      }
    });
  });

  // 3D Canvas Explode Button
  const explodeBtn = document.getElementById('canvas-explode-btn');
  if (explodeBtn) {
    explodeBtn.addEventListener('click', () => {
      const active = explodeBtn.classList.toggle('active');
      explodeBtn.querySelector('span').textContent = active ? 'ASSEMBLE MODEL' : 'EXPLODE LAYERS';
      if (gzn3D) {
        gzn3D.setExploded(active);
        playMetallicClick();
      }
    });
  }

  // Hero Deconstruct Trigger (Smooth scrolls and explodes)
  const heroDeconstruct = document.getElementById('hero-deconstruct-trigger');
  if (heroDeconstruct) {
    heroDeconstruct.addEventListener('click', () => {
      if (explodeBtn) {
        explodeBtn.classList.add('active');
        explodeBtn.querySelector('span').textContent = 'ASSEMBLE MODEL';
        if (gzn3D) gzn3D.setExploded(true);
        playMetallicClick();
      }
    });
  }

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
      store.addToCart('gzn-undisputed-belt', 'OFFICIAL REPLICA');
      openCart();
    });
  }

  // Bundle Claim Button
  const bundleBtn = document.getElementById('claim-bundle-btn');
  if (bundleBtn) {
    bundleBtn.addEventListener('click', () => {
      store.addToCart('gzn-x1', '16-OZ');
      store.addToCart('gzn-shin', 'L');
      playPunchImpact();
      openCart();
    });
  }

  // Cart Drawer open/close triggers
  document.getElementById('cart-toggle-btn').addEventListener('click', openCart);
  document.getElementById('cart-close-btn').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);

  // Checkout Button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (store.getCartCount() === 0) {
        alert('Your tactical bag is currently empty. Select weaponry from the Armory.');
        return;
      }
      playPunchImpact();
      alert('⚡ GZN TACTICAL CHECKOUT INITIALIZED.\n\nPreparing secure encrypted dispatch token...\nThank you for choosing GZNSPORTS.');
    });
  }
}

// Update Cart UI
function updateCartUI() {
  const counter = document.getElementById('cart-counter-badge');
  const itemsContainer = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal-price');
  const meterFill = document.getElementById('shipping-meter-fill');
  const meterPercent = document.getElementById('shipping-percent-text');
  const meterStatus = document.getElementById('shipping-status-text');

  if (counter) {
    const count = store.getCartCount();
    counter.textContent = count;
    counter.classList.toggle('has-items', count > 0);
  }
  if (subtotalEl) subtotalEl.textContent = `$${store.getCartSubtotal().toFixed(2)}`;

  // Shipping progress
  const shipping = store.getFreeShippingProgress();
  if (meterFill) meterFill.style.width = `${shipping.percent}%`;
  if (meterPercent) meterPercent.textContent = `${shipping.percent}%`;
  if (meterStatus) {
    meterStatus.textContent = shipping.unlocked
      ? 'FREE COMBAT DISPATCH UNLOCKED! ✓'
      : `ADD $${shipping.remaining.toFixed(2)} FOR FREE EXPRESS AIR DISPATCH`;
  }

  // Cart Items
  if (itemsContainer) {
    if (store.cart.length === 0) {
      itemsContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--gzn-slate);">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">🛡️</div>
          <div style="font-family: var(--font-display); font-size: 1.1rem; color: var(--gzn-titanium); margin-bottom: 0.5rem;">YOUR ARMORY BAG IS EMPTY</div>
          <p class="mono-tag">NO EQUIPMENT SLOTTED FOR DISPATCH</p>
        </div>
      `;
      return;
    }

    itemsContainer.innerHTML = store.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
        <div>
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-size">SIZE: ${item.size} // $${item.price}</div>
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="window.updateCartQty('${item.id}', '${item.size}', -1)">-</button>
            <span class="mono-tag" style="min-width: 18px; text-align: center;">${item.quantity}</span>
            <button class="qty-btn" onclick="window.updateCartQty('${item.id}', '${item.size}', 1)">+</button>
          </div>
        </div>
        <div>
          <div style="font-family: var(--font-mono); font-weight: 700; margin-bottom: 0.4rem;">
            $${(item.price * item.quantity).toFixed(2)}
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
        <span class="mono-tag crimson">${product.categoryName}</span>
        <h2 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; margin: 0.4rem 0;">${product.title}</h2>
        <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--gzn-crimson); margin-bottom: 1rem;">
          $${product.price}.00
        </div>
        <p style="color: var(--gzn-slate); font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.5rem;">${product.description}</p>
        
        <div style="background: var(--gzn-void); border: 1px solid var(--gzn-border); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
          <span class="mono-tag" style="display: block; margin-bottom: 0.5rem;">LAB SPECIFICATIONS:</span>
          ${product.specs.map(s => `
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; padding: 0.25rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span style="color: var(--gzn-slate);">${s.label}:</span>
              <span style="font-family: var(--font-mono); color: var(--gzn-titanium);">${s.value}</span>
            </div>
          `).join('')}
        </div>

        <button class="btn-primary" id="modal-add-btn" style="width: 100%;">
          <span>ADD TO ARMORY ($${product.price}.00)</span>
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
