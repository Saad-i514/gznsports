import { store } from "./store.js";
import { escapeHTML as e, displayTitle } from "./ui.js";

export function initModals() {
  const container = document.createElement("div");
  container.id = "genz-global-modals";
  container.innerHTML = `<div class="modal-overlay search-modal-overlay" id="search-modal"><div class="search-modal-card"><div class="search-header-row"><label class="sr-only" for="search-palette-input">Search the collection</label><input id="search-palette-input" placeholder="Find your next piece…" type="search" autocomplete="off" /><button class="modal-close-btn" data-close-modal aria-label="Close search">✕</button></div><div class="search-category-filter" aria-label="Search category"><button class="search-cat-pill active" data-cat="all" aria-pressed="true">All pieces</button><button class="search-cat-pill" data-cat="belts" aria-pressed="false">Belts</button><button class="search-cat-pill" data-cat="hoodies" aria-pressed="false">Hoodies</button><button class="search-cat-pill" data-cat="accessories" aria-pressed="false">Accessories</button></div><div class="search-results-list" id="search-results-container" aria-live="polite"></div><div class="search-footer-hint">ESC to close · Ctrl / ⌘ K to search</div></div></div>
  <div class="modal-overlay" id="faq-modal"><div class="modal-content info-modal-card"><button class="modal-close-btn" data-close-modal aria-label="Close sizing and care">✕</button><div class="info-modal-header"><p class="eyebrow">GNZSPORTS / THE DETAILS</p><h2>SIZING & CARE.</h2></div><div class="faq-accordion-list"><details class="faq-item" open><summary class="faq-q">How do the hoodies fit?</summary><p class="faq-a">Our heavyweight styles have a relaxed, drop-shoulder silhouette. Choose your usual size for the intended fit. Check the specifications on each product before ordering.</p></details><details class="faq-item"><summary class="faq-q">How large are the championship belts?</summary><p class="faq-a">Strap lengths vary by model and edition. Open a product’s details to see its strap specification and available editions.</p></details><details class="faq-item"><summary class="faq-q">How should I care for my pieces?</summary><p class="faq-a">Use a soft, dry cloth on metal plates and avoid abrasive cleaners. Follow the garment care label for hoodies; cold washing and air drying help preserve the fabric and finish.</p></details><details class="faq-item"><summary class="faq-q">What happens when I request an order?</summary><p class="faq-a">Your selection and contact details are sent to the store for confirmation. No payment is collected online. Confirm availability, shipping costs, delivery timing, and return terms with the store before payment.</p></details></div></div></div>
  <div class="modal-overlay" id="legal-modal"><div class="modal-content info-modal-card"><button class="modal-close-btn" data-close-modal aria-label="Close store information">✕</button><div class="info-modal-header"><p class="eyebrow">GNZSPORTS</p><h2 id="legal-modal-title">STORE INFORMATION</h2></div><p id="legal-modal-body">This storefront accepts order requests. No online payment is collected. Availability, shipping costs, delivery timing and return arrangements must be confirmed with the store before payment.</p></div></div>`;
  document.body.append(container);
  document.querySelectorAll('[data-modal="faq"]').forEach((link) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openModal("faq-modal");
    }),
  );
  container
    .querySelectorAll("[data-close-modal]")
    .forEach((button) => button.addEventListener("click", closeAllModals));
  document.addEventListener("click", (event) => {
    if (event.target.matches(".modal-overlay"))
      event.target.classList.remove("open");
  });
  document.addEventListener("keydown", (event) => {
    if (
      (event.key === "/" ||
        ((event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "k")) &&
      !event.target.matches('input,textarea,select,[contenteditable="true"]')
    ) {
      event.preventDefault();
      openSearchModal();
    }
  });
  document
    .getElementById("header-search-btn")
    .addEventListener("click", openSearchModal);
  document
    .getElementById("search-palette-input")
    .addEventListener("input", renderSearchResults);
  container.querySelectorAll(".search-cat-pill").forEach((button) =>
    button.addEventListener("click", () => {
      container.querySelectorAll(".search-cat-pill").forEach((pill) => {
        const active = pill === button;
        pill.classList.toggle("active", active);
        pill.setAttribute("aria-pressed", String(active));
      });
      renderSearchResults();
    }),
  );
  store.subscribe(() => {
    if (document.getElementById("search-modal").classList.contains("open"))
      renderSearchResults();
  });
}
export function openModal(id) {
  document.getElementById(id)?.classList.add("open");
}
export function closeAllModals() {
  document
    .querySelectorAll(".modal-overlay")
    .forEach((modal) => modal.classList.remove("open"));
}
export function openSearchModal() {
  openModal("search-modal");
  renderSearchResults();
  requestAnimationFrame(() =>
    document.getElementById("search-palette-input").focus(),
  );
}
function renderSearchResults() {
  const container = document.getElementById("search-results-container");
  const query = document
    .getElementById("search-palette-input")
    .value.trim()
    .toLowerCase();
  const category = document.querySelector(".search-cat-pill.active").dataset
    .cat;
  const matches = store
    .getProducts()
    .filter(
      (p) =>
        (category === "all" || p.category === category) &&
        `${p.title} ${p.description || ""} ${p.tag || ""}`
          .toLowerCase()
          .includes(query),
    );
  if (!matches.length) {
    container.innerHTML = `<p class="search-empty">No pieces match “${e(query)}”. Try “belt”, “hoodie”, or “gold”.</p>`;
    return;
  }
  container.innerHTML = matches
    .map(
      (p) =>
        `<button class="search-result-item" data-id="${e(p.id)}"><img src="${e(p.image)}" alt="" class="search-item-img" /><span class="search-item-info"><span class="product-category">${e(p.category.toUpperCase())}</span><span class="search-item-title">${e(displayTitle(p))}</span><span class="search-item-price">${store.formatPrice(p.price)}</span></span><span aria-hidden="true">↗</span></button>`,
    )
    .join("");
  container.querySelectorAll(".search-result-item").forEach((button) =>
    button.addEventListener("click", () => {
      closeAllModals();
      window.openQuickView?.(button.dataset.id);
    }),
  );
}
