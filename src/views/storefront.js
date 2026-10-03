import { CATEGORIES } from "../catalog.js";
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
      ${CATEGORIES.map((c) => `<a href="#armory" data-category="${c.id}">${c.name}</a>`).join("")}
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
    ${CATEGORIES.map((c) => `<a href="#armory" data-category="${c.id}">${c.name} ${arrow}</a>`).join("")}<a href="#craft">The details ${arrow}</a><a href="#story">Our mindset ${arrow}</a>
  </nav>
  <main id="main-content">
    <section class="campaign-hero" aria-labelledby="hero-title">
      <div class="hero-art" aria-hidden="true"><img src="/images/hoodies/genz-heavyweight-hoodie.webp" alt="" width="1376" height="768" fetchpriority="high" /></div>
      <div class="hero-vignette"></div><div class="hero-grain"></div>
      <div class="hero-topline"><span><i class="live-dot"></i> THE EVERYDAY COLLECTION</span><span>EST. MMXXVI / VOL. 01</span></div>
      <div class="campaign-copy"><p class="eyebrow">FOR THE ONES WHO PUT IN THE WORK.</p><h1 id="hero-title">YOUR DAY.<br><span>YOUR WAY.</span></h1><p class="hero-description">Hoodies, tracksuits, tees and more.<br>Everyday pieces. Unmistakably you.</p><div class="hero-buttons"><a class="action-button" href="#armory" data-category="all">Explore the collection ${arrow}</a><a class="text-link light" href="#craft">Discover the craft <span>↓</span></a></div></div>
      <div class="hero-bottom"><a href="#collections" class="scroll-cue"><span>↓</span> SCROLL TO DISCOVER</a><span class="hero-caption">HOODIES / TRACKSUITS / T-SHIRTS / FASHION / BAGS / OTHERS</span><span class="slide-index">01 <span>/ 01</span></span></div>
    </section>
    <div class="brand-ribbon" aria-label="Brand values"><span>BUILT WITH INTENT</span><i>✳</i><span>WORN WITH PRIDE</span><i>✳</i><span>EVERY DETAIL COUNTS</span><i>✳</i><span>THE GNZ STANDARD</span><i>✳</i></div>
    <section class="section-shell collections-section" id="collections">
      <div class="section-heading reveal"><div><p class="eyebrow">01 / FIND YOUR EXPRESSION</p><h2>SIX WAYS.<br>TO MAKE IT YOURS.</h2></div><p class="section-intro">From your first layer to your last detail.<br>Explore the world of GNZSPORTS.</p></div>
      <div class="collections-grid reveal">${CATEGORIES.map((c) => category(c.id, c.symbol, c.name, c.copy, `/images/samples/${c.id}.svg`)).join("")}</div>
    </section>
    <section class="section-shell catalog-section" id="armory" aria-labelledby="catalog-title">
      <div class="section-heading reveal"><div><p class="eyebrow">02 / THE COLLECTION</p><h2 id="catalog-title">YOUR NEXT STATEMENT.</h2></div><span class="collection-count" id="collection-count"></span></div>
      <div class="catalog-toolbar"><div class="filter-bar" id="category-filter-bar" aria-label="Filter products"><button class="filter-tab active" data-cat="all" aria-pressed="true">All pieces</button>${CATEGORIES.map((c) => `<button class="filter-tab" data-cat="${c.id}" aria-pressed="false">${c.name}</button>`).join("")}</div><label class="sort-label">Sort by <select id="catalog-sort" aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
      <div class="armory-grid" id="product-grid-container" aria-live="polite"></div>
    </section>
    <section class="craft-section" id="craft" aria-labelledby="craft-title">
      <div class="craft-copy reveal"><p class="eyebrow">03 / OBSESSION IS IN THE DETAILS</p><h2 id="craft-title">NOT JUST SEEN.<br><em>FELT.</em></h2><p>The texture. The silhouette. The finishing touches. Get closer to the details that make an everyday piece feel like your own.</p>
      <div class="material-tabs" role="tablist" aria-label="Explore garment details"><button role="tab" id="material-fabric" aria-selected="true" aria-controls="material-panel" data-material="fabric">01 / The fabric</button><button role="tab" id="material-fit" aria-selected="false" aria-controls="material-panel" tabindex="-1" data-material="fit">02 / The fit</button><button role="tab" id="material-detail" aria-selected="false" aria-controls="material-panel" tabindex="-1" data-material="detail">03 / The detail</button></div>
      <div id="material-panel" role="tabpanel" aria-labelledby="material-fabric" tabindex="0"><h3>TEXTURE WITH PRESENCE.</h3><p>Explore the surface and texture of our everyday layers. Check each product for its specific fabric composition.</p></div><a class="text-link light" href="#armory" data-category="hoodies">Find your everyday layer ${arrow}</a></div>
      <div class="material-studio" id="material-studio"><img class="studio-fallback" src="/images/hoodies/genz-zip-hoodie.webp" alt="Full-zip hoodie with textured fabric and considered details" loading="lazy" width="1200" height="896" /><div class="studio-label"><span><i class="live-dot"></i> EVERYDAY LAYERS / THE DETAILS</span><span>PHOTOGRAPHIC STUDY</span></div><div class="studio-foot"><span id="studio-status" role="status">FABRIC / PHOTOGRAPHIC DETAIL</span><div><button class="studio-control" id="studio-left" aria-label="Previous garment detail">←</button><button class="studio-control" id="studio-right" aria-label="Next garment detail">→</button><button class="studio-control" id="studio-reset" aria-label="Reset garment view">↺</button></div></div><span class="study-note">GNZSPORTS / THE EVERYDAY COLLECTION</span></div>
    </section>
    <section class="hoodie-editorial" aria-labelledby="hoodie-title"><div class="editorial-image"><img src="/images/hoodies/genz-raw-cut-hoodie.webp" alt="Heavyweight black hoodie with a relaxed silhouette" width="1200" height="896" loading="lazy" /></div><div class="editorial-copy reveal"><p class="eyebrow">OFF-DUTY. NEVER OFF YOUR GAME.</p><h2 id="hoodie-title">HEAVYWEIGHT.<br>IN EVERY SENSE.</h2><p>Substantial cotton. A considered silhouette. The layer you reach for from early starts to late finishes.</p><div class="textile-specs"><span><b>06</b> COLLECTIONS</span><span><b>100%</b> PRESENCE</span></div><a class="action-button dark-button" href="#armory" data-category="hoodies">Find your everyday layer ${arrow}</a><small>Sample collection shown. Final materials and measurements vary by product.</small></div></section>
    <section class="mindset-section section-shell" id="story"><div class="mindset-top"><p class="eyebrow">04 / THE GNZ MINDSET</p><span>AMBITION IS A DAILY PRACTICE.</span></div><h2 class="reveal">THE MOMENT IS YOURS.<br><span>THE WORK IS FOREVER.</span></h2><div class="mindset-bottom"><span class="mini-mark">GNZ<span>®</span></span><p>We make pieces for people who care about the process. The quiet repetitions. The small details. The belief that what you put in is what you carry with you.</p><a class="text-link" href="#collections">Wear your mindset ${arrow}</a></div></section>
    <section class="service-strip" aria-label="Shopping support"><div>${icon("globe")}<h3>WORLDWIDE DISPATCH</h3><p>From our collection to your corner.</p></div><div>${icon("layers")}<h3>DETAILS THAT MATTER</h3><p>Explore materials, sizing, and fit.</p></div><div>${icon("message")}<h3>HERE FOR YOUR QUESTIONS</h3><a href="#faq" data-modal="faq">Visit the help desk ↗</a></div></section>
    <section class="final-cta"><p class="eyebrow">YOUR NEXT CHAPTER STARTS HERE.</p><h2>MAKE IT<br><em>YOUR MOMENT.</em></h2><a class="action-button" href="#armory" data-category="all">Shop the collection ${arrow}</a><span class="cta-watermark" aria-hidden="true">GNZ</span></section>
  </main>
  <footer class="site-footer"><div class="footer-main"><a class="wordmark" href="#" aria-label="GNZSPORTS home">${wordmark}</a><p>Your style.<br>Everyday expression.</p><div><h3>THE COLLECTION</h3>${CATEGORIES.map((c) => `<a href="#armory" data-category="${c.id}">${c.name}</a>`).join("")}</div><div><h3>THE BRAND</h3><a href="#craft">The craft</a><a href="#story">Our mindset</a><a href="#faq" data-modal="faq">Sizing & care</a></div><div><h3>YOUR SPACE</h3><a id="contact-email" href="mailto:gulraizbutt297@gmail.com">gulraizbutt297@gmail.com</a><a id="contact-phone" href="tel:+923316841666">+92 331 6841666</a><button id="footer-account-btn">Your account</button><button id="header-admin-btn">Store manager</button><button id="audio-toggle-btn">Sound <span id="audio-icon">off</span></button></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} GNZSPORTS</span><span>BUILT WITH INTENT. WORN WITH PRIDE.</span><a href="#" class="policy-link" data-policy="Store information">Store information ↗</a></div></footer>`;
}
