import { icon, wordmark } from "../ui.js";

const arrow = '<span aria-hidden="true">↗</span>';
const category = (id, number, title, copy, image) => `
  <a class="collection-card" href="#armory" data-category="${id}">
    <img src="${image}" alt="${title}" loading="lazy" width="1200" height="896" />
    <span class="collection-number">COLLECTION / ${number}</span>
    <div class="collection-caption"><div><p>${copy}</p><h3>${title}</h3></div><span class="round-arrow">↗</span></div>
  </a>`;

export function storefront() {
  return `
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="announcement"><span>BUILT FOR THE MOMENT. MADE FOR THE EVERYDAY.</span><span>WORLDWIDE SHIPPING <i>↗</i></span></div>
  <header class="site-header" id="site-header">
    <a class="wordmark" href="#" aria-label="GNZSPORTS home">${wordmark}</a>
    <nav class="desktop-nav" aria-label="Main navigation">
      <a href="#armory" data-category="belts">Championship belts</a><a href="#armory" data-category="hoodies">Heavyweight hoodies</a><a href="#craft">The craft</a><a href="#story">Our mindset</a>
    </nav>
    <div class="header-actions">
      <label class="currency-label"><span class="sr-only">Currency</span><select id="currency-select"><option>USD</option><option>GBP</option><option>EUR</option><option>CAD</option><option>AUD</option></select></label>
      <button class="icon-button" id="header-search-btn" aria-label="Search products">${icon("search")}</button>
      <button class="icon-button account-button" id="header-account-btn" aria-label="Your account">${icon("user")}</button>
      <button class="bag-button" id="cart-toggle-btn" aria-label="Open shopping bag">${icon("bag")}<span class="bag-label">Bag</span><span id="cart-counter-badge">0</span></button>
      <button class="icon-button menu-toggle" id="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">${icon("menu")}</button>
    </div>
  </header>
  <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation" hidden>
    <a href="#armory" data-category="belts">Championship belts ${arrow}</a><a href="#armory" data-category="hoodies">Heavyweight hoodies ${arrow}</a><a href="#craft">The craft ${arrow}</a><a href="#story">Our mindset ${arrow}</a>
  </nav>
  <main id="main-content">
    <section class="campaign-hero" aria-labelledby="hero-title">
      <div class="hero-art" aria-hidden="true"><img src="/images/hero-dual-showcase.webp" alt="" width="1376" height="768" fetchpriority="high" /></div>
      <div class="hero-vignette"></div><div class="hero-grain"></div>
      <div class="hero-topline"><span><i class="live-dot"></i> THE CHAMPIONSHIP COLLECTION</span><span>EST. MMXXVI / VOL. 01</span></div>
      <div class="campaign-copy"><p class="eyebrow">FOR THE ONES WHO PUT IN THE WORK.</p><h1 id="hero-title">EARNED.<br><span>NEVER GIVEN.</span></h1><p class="hero-description">Championship gold. Heavyweight essentials.<br>Made for a mindset that never clocks out.</p><div class="hero-buttons"><a class="action-button" href="#armory" data-category="all">Explore the collection ${arrow}</a><a class="text-link light" href="#craft">Discover the craft <span>↓</span></a></div></div>
      <div class="hero-bottom"><a href="#collections" class="scroll-cue"><span>↓</span> SCROLL TO DISCOVER</a><span class="hero-caption">24K GOLD FINISH <b>×</b> 450GSM HEAVYWEIGHT COTTON</span><span class="slide-index">01 <span>/ 01</span></span></div>
    </section>
    <div class="brand-ribbon" aria-label="Brand values"><span>BUILT WITH INTENT</span><i>✳</i><span>WORN WITH PRIDE</span><i>✳</i><span>EVERY DETAIL COUNTS</span><i>✳</i><span>THE GNZ STANDARD</span><i>✳</i></div>
    <section class="section-shell collections-section" id="collections">
      <div class="section-heading reveal"><div><p class="eyebrow">01 / FIND YOUR EXPRESSION</p><h2>TWO WORLDS.<br>ONE MINDSET.</h2></div><p class="section-intro">For the spotlight. For the streets.<br>Different expressions of the same ambition.</p></div>
      <div class="collections-grid reveal">${category("belts", "01", "CHAMPIONSHIP BELTS", "A legacy you can hold.", "/images/belts/world-heavyweight-belt.webp")}${category("hoodies", "02", "HEAVYWEIGHT ESSENTIALS", "Presence. Without saying a word.", "/images/hoodies/genz-heavyweight-hoodie.webp")}</div>
    </section>
    <section class="section-shell catalog-section" id="armory" aria-labelledby="catalog-title">
      <div class="section-heading reveal"><div><p class="eyebrow">02 / THE COLLECTION</p><h2 id="catalog-title">YOUR NEXT STATEMENT.</h2></div><span class="collection-count" id="collection-count"></span></div>
      <div class="catalog-toolbar"><div class="filter-bar" id="category-filter-bar" aria-label="Filter products"><button class="filter-tab active" data-cat="all" aria-pressed="true">All pieces</button><button class="filter-tab" data-cat="belts" aria-pressed="false">Championship belts</button><button class="filter-tab" data-cat="hoodies" aria-pressed="false">Heavyweight hoodies</button><button class="filter-tab" data-cat="accessories" aria-pressed="false">Accessories</button></div><label class="sort-label">Sort by <select id="catalog-sort" aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
      <div class="armory-grid" id="product-grid-container" aria-live="polite"></div>
    </section>
    <section class="craft-section" id="craft" aria-labelledby="craft-title">
      <div class="craft-copy reveal"><p class="eyebrow">03 / OBSESSION IS IN THE DETAILS</p><h2 id="craft-title">NOT JUST SEEN.<br><em>FELT.</em></h2><p>Weight in your hands. Texture under your fingertips. A finish that catches the light. This is what separates an object from a statement.</p>
      <div class="material-tabs" role="tablist" aria-label="Explore belt construction"><button role="tab" id="material-gold" aria-selected="true" aria-controls="material-panel" data-material="gold">01 / The gold</button><button role="tab" id="material-leather" aria-selected="false" aria-controls="material-panel" tabindex="-1" data-material="leather">02 / The foundation</button><button role="tab" id="material-detail" aria-selected="false" aria-controls="material-panel" tabindex="-1" data-material="detail">03 / The detail</button></div>
      <div id="material-panel" role="tabpanel" aria-labelledby="material-gold" tabindex="0"><h3>DEPTH YOU CAN FEEL.</h3><p>Deep-relief brass plates with a warm gold finish. Sculpted surfaces create a different reflection from every angle.</p></div><a class="text-link light" href="#armory" data-category="belts">Find your championship belt ${arrow}</a></div>
      <div class="material-studio" id="material-studio"><img class="studio-fallback" src="/images/belts/world-heavyweight-belt.webp" alt="Gold championship plate with sculpted detail" loading="lazy" width="1200" height="896" /><div class="studio-label"><span><i class="live-dot"></i> WORLD HEAVYWEIGHT / THE DETAILS</span><span>PHOTOGRAPHIC STUDY</span></div><div class="studio-foot"><span id="studio-status" role="status">GOLD / PHOTOGRAPHIC DETAIL</span><div><button class="studio-control" id="studio-left" aria-label="Previous belt detail">←</button><button class="studio-control" id="studio-right" aria-label="Next belt detail">→</button><button class="studio-control" id="studio-reset" aria-label="Reset belt view">↺</button></div></div><span class="study-note">WORLD HEAVYWEIGHT CHAMPIONSHIP BELT</span></div>
    </section>
    <section class="hoodie-editorial" aria-labelledby="hoodie-title"><div class="editorial-image"><img src="/images/hoodies/genz-raw-cut-hoodie.webp" alt="Heavyweight black hoodie with a relaxed silhouette" width="1200" height="896" loading="lazy" /></div><div class="editorial-copy reveal"><p class="eyebrow">OFF-DUTY. NEVER OFF YOUR GAME.</p><h2 id="hoodie-title">HEAVYWEIGHT.<br>IN EVERY SENSE.</h2><p>Substantial cotton. A considered silhouette. The layer you reach for before the first bell and long after the last.</p><div class="textile-specs"><span><b>450</b> GSM COTTON*</span><span><b>100%</b> PRESENCE</span></div><a class="action-button dark-button" href="#armory" data-category="hoodies">Find your everyday armor ${arrow}</a><small>*Apex hoodie. Fabric weight varies by style.</small></div></section>
    <section class="mindset-section section-shell" id="story"><div class="mindset-top"><p class="eyebrow">04 / THE GNZ MINDSET</p><span>AMBITION IS A DAILY PRACTICE.</span></div><h2 class="reveal">THE MOMENT IS YOURS.<br><span>THE WORK IS FOREVER.</span></h2><div class="mindset-bottom"><span class="mini-mark">GNZ<span>®</span></span><p>We make pieces for people who care about the process. The quiet repetitions. The small details. The belief that what you put in is what you carry with you.</p><a class="text-link" href="#collections">Wear your mindset ${arrow}</a></div></section>
    <section class="service-strip" aria-label="Shopping support"><div>${icon("globe")}<h3>WORLDWIDE DISPATCH</h3><p>From our collection to your corner.</p></div><div>${icon("layers")}<h3>DETAILS THAT MATTER</h3><p>Explore materials, sizing, and fit.</p></div><div>${icon("message")}<h3>HERE FOR YOUR QUESTIONS</h3><a href="#faq" data-modal="faq">Visit the help desk ↗</a></div></section>
    <section class="final-cta"><p class="eyebrow">YOUR NEXT CHAPTER STARTS HERE.</p><h2>MAKE IT<br><em>YOUR MOMENT.</em></h2><a class="action-button" href="#armory" data-category="all">Shop the collection ${arrow}</a><span class="cta-watermark" aria-hidden="true">GNZ</span></section>
  </main>
  <footer class="site-footer"><div class="footer-main"><a class="wordmark" href="#" aria-label="GNZSPORTS home">${wordmark}</a><p>Championship spirit.<br>Everyday expression.</p><div><h3>THE COLLECTION</h3><a href="#armory" data-category="belts">Championship belts</a><a href="#armory" data-category="hoodies">Heavyweight hoodies</a><a href="#armory" data-category="accessories">Accessories</a></div><div><h3>THE BRAND</h3><a href="#craft">The craft</a><a href="#story">Our mindset</a><a href="#faq" data-modal="faq">Sizing & care</a></div><div><h3>YOUR SPACE</h3><a id="contact-email" href="mailto:gulraizbutt297@gmail.com">gulraizbutt297@gmail.com</a><a id="contact-phone" href="tel:+923316841666">+92 331 6841666</a><button id="footer-account-btn">Your account</button><button id="header-admin-btn">Store manager</button><button id="audio-toggle-btn">Sound <span id="audio-icon">off</span></button></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} GNZSPORTS</span><span>BUILT WITH INTENT. WORN WITH PRIDE.</span><a href="#" class="policy-link" data-policy="Store information">Store information ↗</a></div></footer>`;
}
