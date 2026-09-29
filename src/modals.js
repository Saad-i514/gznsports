// GENZ SPORTS // INTERACTIVE MODALS & TERMINAL DIALOGS
import { PRODUCTS, store } from './store.js';
import { playMetallicClick, playPunchImpact } from './audio.js';

/**
 * Initialize all interactive modals across the site
 */
export function initModals() {
  renderModalsContainer();
  attachModalTriggers();
}

function renderModalsContainer() {
  let container = document.getElementById('genz-global-modals');
  if (!container) {
    container = document.createElement('div');
    container.id = 'genz-global-modals';
    document.body.appendChild(container);
  }

  container.innerHTML = `
    <!-- 1. TACTICAL SEARCH PALETTE MODAL -->
    <div class="modal-overlay search-modal-overlay" id="search-modal">
      <div class="search-modal-card">
        <div class="search-header-row">
          <div class="search-input-wrap">
            <span class="search-icon">🔍</span>
            <input type="text" id="search-palette-input" placeholder="Search Championship Belts, 450GSM Hoodies, Wall Mounts..." autocomplete="off" />
          </div>
          <button class="modal-close-btn" id="close-search-btn">✕</button>
        </div>

        <div class="search-category-filter">
          <button class="search-cat-pill active" data-cat="all">ALL GEAR</button>
          <button class="search-cat-pill" data-cat="belts">🏆 TITLE BELTS</button>
          <button class="search-cat-pill" data-cat="hoodies">🧥 450GSM HOODIES</button>
          <button class="search-cat-pill" data-cat="accessories">🛡️ ACCESSORIES</button>
        </div>

        <div class="search-results-list" id="search-results-container">
          <!-- Dynamically populated -->
        </div>

        <div class="search-footer-hint">
          <span class="mono-tag">HINT: Press [ESC] to exit or [Ctrl + K] / [/] to open anytime</span>
        </div>
      </div>
    </div>

    <!-- 2. GENZ COMBAT & TEXTILE LAB MODAL -->
    <div class="modal-overlay" id="lab-modal">
      <div class="modal-content info-modal-card">
        <button class="modal-close-btn" id="close-lab-btn">✕</button>
        <div class="info-modal-header">
          <span class="mono-tag crimson">[ BIOMECHANICAL R&D ARCHIVE ]</span>
          <h2>THE GENZ CRAFTSMANSHIP LAB</h2>
          <p class="mono-tag" style="color:var(--gzn-slate);">PRECISION 8MM CNC GOLD CASTING & 450GSM FRENCH TERRY WEAVE</p>
        </div>

        <div class="lab-specs-grid">
          <div class="lab-card">
            <h4>🏆 24K DUAL-DIP ELECTROPLATING</h4>
            <p>Every championship belt features solid 8mm deep-relief CNC sculpted brass plates subjected to multi-stage gold electroplating: a high-durability nickel substrate followed by mirror-polished 24K gold and antique stippling.</p>
          </div>
          <div class="lab-card">
            <h4>💎 CUBIC ZIRCONIA DIAMOND FRAME</h4>
            <p>Over 1,000 brilliant square-cut and round faceted cubic zirconia crystals are hand-set with dual-prong stainless steel mounts, creating unmatched diamond brilliance under arena spotlights.</p>
          </div>
          <div class="lab-card">
            <h4>🧥 450GSM ULTRA-HEAVY FRENCH TERRY</h4>
            <p>Our hoodies use zero cheap synthetic polyester. Woven exclusively from 450GSM 100% combed long-staple cotton, double-layered hoods, reinforced drop-shoulders, and 24K gold dipped drawcord aglets.</p>
          </div>
          <div class="lab-card">
            <h4>🛡️ 4MM FULL-GRAIN SADDLE LEATHER</h4>
            <p>Handcrafted vegetable-tanned full-grain leather straps treated with hot obsidian wax. Features dual-row 8-snap solid brass closures tested to withstand over 2,000 lbs of tensile pulling force.</p>
          </div>
        </div>

        <div style="margin-top: 2rem; text-align: center;">
          <button class="btn-primary" id="lab-explore-btn" style="padding:0.9rem 2.2rem;">
            <span>EXPLORE ARMORY COLLECTION →</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 3. THE GENZ PROMISE & GUARANTEE MODAL -->
    <div class="modal-overlay" id="why-genz-modal">
      <div class="modal-content info-modal-card">
        <button class="modal-close-btn" id="close-why-btn">✕</button>
        <div class="info-modal-header">
          <span class="mono-tag crimson">[ THE GENZ STANDARD ]</span>
          <h2>WHY CHOOSE GENZ SPORTS?</h2>
          <p class="mono-tag" style="color:var(--gzn-slate);">UNCOMPROMISING METALLURGY & TEXTILE EXCELLENCE</p>
        </div>

        <div class="lab-specs-grid">
          <div class="lab-card">
            <h4>⚡ 365-DAY STRIKE & SNAP WARRANTY</h4>
            <p>If any snap on your championship title belt loosens, any gemstone dislodges, or any seam on your 450GSM hoodie unravels within 365 days, we replace it free of charge. No questions asked.</p>
          </div>
          <div class="lab-card">
            <h4>✈️ WORLDWIDE ARMORED DISPATCH</h4>
            <p>Every order is dispatched in reinforced packaging. Belts include plush velvet transport covers; hoodies ship in sealed matte combat bags with serialized authenticity certificates.</p>
          </div>
          <div class="lab-card">
            <h4>🚫 ZERO COMPROMISE GUARANTEE</h4>
            <p>We reject zinc alloy plates, vinyl leatherette straps, and thin 280GSM polyester fleece. If your equipment does not feel like genuine championship armor, return it for a 100% refund.</p>
          </div>
          <div class="lab-card">
            <h4>🔒 SECURE ENCRYPTED CHECKOUT</h4>
            <p>Direct Supabase PostgreSQL database architecture with 256-bit encrypted transactions, multi-currency support, and live order telemetry tracking.</p>
          </div>
        </div>

        <div style="margin-top: 2rem; text-align: center;">
          <button class="btn-primary" id="why-shop-btn" style="padding:0.9rem 2.2rem;">
            <span>CLAIM YOUR GEAR NOW →</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 4. HELP, SIZING & DISPATCH TERMINAL MODAL -->
    <div class="modal-overlay" id="faq-modal">
      <div class="modal-content info-modal-card">
        <button class="modal-close-btn" id="close-faq-btn">✕</button>
        <div class="info-modal-header">
          <span class="mono-tag crimson">[ ATHLETE ASSISTANCE ]</span>
          <h2>DISPATCH & SIZING TERMINAL</h2>
          <p class="mono-tag" style="color:var(--gzn-slate);">FREQUENTLY ASKED QUESTIONS & METRIC CHARTS</p>
        </div>

        <div class="faq-accordion-list">
          <div class="faq-item">
            <h4 class="faq-q">📏 WHAT ARE THE BELT STRAP DIMENSIONS & FIT?</h4>
            <p class="faq-a">Our adult championship replica belts measure 52" to 54" in total length and fit waists from 30" to 48" comfortably. The dual-row 8-snap box allows micro-adjustments for perfect shoulder drape or waist display.</p>
          </div>

          <div class="faq-item">
            <h4 class="faq-q">👕 HOW DO THE 450GSM HOODIES FIT?</h4>
            <p class="faq-a">Our hoodies feature a tailored modern streetwear oversized drop-shoulder cut. Order your true size for a relaxed, heavyweight aesthetic, or size down one size for a fitted athletic silhouette.</p>
          </div>

          <div class="faq-item">
            <h4 class="faq-q">📦 WHAT ARE THE GLOBAL SHIPPING TIMELINES?</h4>
            <p class="faq-a">Domestic orders dispatch within 24-48 hours via FedEx Priority Air (2-4 business days). International express shipments typically arrive within 4-7 business days with end-to-end telemetry tracking.</p>
          </div>

          <div class="faq-item">
            <h4 class="faq-q">🧼 HOW DO I CARE FOR MY TITLE BELT & HOODIE?</h4>
            <p class="faq-a">Clean gold plates with a soft microfiber cloth (avoid harsh chemicals). Treat saddle leather with beeswax conditioner once yearly. Wash hoodies inside-out in cold water and hang dry to preserve the 450GSM fleece density.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. LEGAL POLICIES MODAL -->
    <div class="modal-overlay" id="legal-modal">
      <div class="modal-content info-modal-card">
        <button class="modal-close-btn" id="close-legal-btn">✕</button>
        <div class="info-modal-header">
          <span class="mono-tag crimson">[ COMPLIANCE & PRIVACY ]</span>
          <h2 id="legal-modal-title">TERMS OF ENGAGEMENT</h2>
          <p class="mono-tag" style="color:var(--gzn-slate);">OFFICIAL GENZ SPORTS STORE POLICIES</p>
        </div>
        <div id="legal-modal-body" style="color:var(--gzn-slate); line-height:1.7; font-size:0.9rem; max-height:450px; overflow-y:auto;">
          <p>GENZ SPORTS guarantees the authenticity of all materials, including 24K gold electroplated cast brass, genuine vegetable-tanned leather, and 450GSM combed cotton fabrics. All customer transaction tokens are encrypted via Supabase Auth and industry-standard payment pipelines. We respect fighter confidentiality and never sell or distribute athlete dispatch telemetry.</p>
        </div>
      </div>
    </div>
  `;
}

function attachModalTriggers() {
  // Top Announcement links
  document.querySelectorAll('a[href="#dossier"], a[data-modal="lab"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('lab-modal');
    });
  });

  document.querySelectorAll('a[href="#standard"], a[data-modal="why"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('why-genz-modal');
    });
  });

  document.querySelectorAll('a[href="#terminal"], a[data-modal="faq"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('faq-modal');
    });
  });

  // Footer legal links
  document.querySelectorAll('.footer-bottom a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const title = link.textContent.trim();
      document.getElementById('legal-modal-title').textContent = title;
      openModal('legal-modal');
    });
  });

  // Close triggers
  ['close-search-btn', 'close-lab-btn', 'close-why-btn', 'close-faq-btn', 'close-legal-btn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Close on outside click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAllModals();
      }
    });
  });

  // Keyboard shortcut: Escape to close, Ctrl+K or / to open search
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
    if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && !e.target.matches('input, textarea')) {
      e.preventDefault();
      openSearchModal();
    }
  });

  // Header Search Button
  document.getElementById('header-search-btn')?.addEventListener('click', () => {
    openSearchModal();
  });

  // Search input & category pills
  const searchInput = document.getElementById('search-palette-input');
  searchInput?.addEventListener('input', () => {
    renderSearchResults();
  });

  document.querySelectorAll('.search-cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.search-cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      playMetallicClick();
      renderSearchResults();
    });
  });

  // Modal CTAs
  document.getElementById('lab-explore-btn')?.addEventListener('click', () => {
    closeAllModals();
    document.getElementById('armory')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('why-shop-btn')?.addEventListener('click', () => {
    closeAllModals();
    document.getElementById('armory')?.scrollIntoView({ behavior: 'smooth' });
  });
}

export function openModal(modalId) {
  playMetallicClick();
  const el = document.getElementById(modalId);
  if (el) el.classList.add('open');
}

export function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  playMetallicClick();
}

export function openSearchModal() {
  openModal('search-modal');
  renderSearchResults();
  setTimeout(() => {
    document.getElementById('search-palette-input')?.focus();
  }, 100);
}

function renderSearchResults() {
  const container = document.getElementById('search-results-container');
  const query = (document.getElementById('search-palette-input')?.value || '').trim().toLowerCase();
  const activePill = document.querySelector('.search-cat-pill.active');
  const cat = activePill ? activePill.getAttribute('data-cat') : 'all';

  if (!container) return;

  const products = store.getProducts();
  const matches = products.filter(p => {
    const matchesCat = cat === 'all' || p.category === cat;
    const matchesQuery = !query || 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) || 
      (p.tag && p.tag.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  if (matches.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; color:var(--gzn-slate);">
        <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
        <p>No weaponry found matching "${query}". Try searching "belt", "hoodie", or "gold".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = matches.map(p => `
    <div class="search-result-item" data-id="${p.id}">
      <img src="${p.image}" alt="${p.title}" class="search-item-img" />
      <div class="search-item-info">
        <span class="mono-tag crimson">${p.categoryName || p.category.toUpperCase()}</span>
        <h4 class="search-item-title">${p.title}</h4>
        <span class="search-item-price">${store.formatPrice(p.price)}</span>
      </div>
      <div class="search-item-actions">
        <button class="btn-primary search-add-btn" data-id="${p.id}">
          <span>ARMOR UP</span>
        </button>
      </div>
    </div>
  `).join('');

  // Attach search result actions
  container.querySelectorAll('.search-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      store.addToCart(id);
      playPunchImpact();
      closeAllModals();
      document.getElementById('cart-drawer')?.classList.add('open');
      document.getElementById('cart-overlay')?.classList.add('open');
    });
  });

  container.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      closeAllModals();
      window.openQuickView?.(id);
    });
  });
}
