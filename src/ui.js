import { categoryName, isApparel } from "./catalog.js";
export const escapeHTML = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
export function icon(name) {
  const paths = {
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    user: '<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
    bag: '<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    menu: '<path d="M3 7h18M3 16h18"/>',
    globe:
      '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    layers: '<path d="m3 8 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5M3 18l9 5 9-5"/>',
    message: '<path d="M21 16H9l-6 5V3h18v13Z"/><path d="M7 8h10M7 12h6"/>',
  };
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.bag}</svg>`;
}
export const wordmark =
  '<span class="brand-symbol" aria-hidden="true"><svg viewBox="0 0 36 38"><path d="M3 4h30L19 17h12L15 35 3 23h10l4 4 5-6H3l15-12H8Z" fill="currentColor"/></svg></span><span>GNZ<span class="wordmark-sports">SPORTS</span></span><sup>®</sup>';

export const displayTitle = (product) => product.title;
const optimizedImages = new Set([
  "hero-dual-showcase",
  "belts/world-heavyweight-belt",
  "belts/intercontinental-belt",
  "hoodies/genz-heavyweight-hoodie",
  "hoodies/genz-raw-cut-hoodie",
  "hoodies/genz-zip-hoodie",
  "gear-macro",
]);
export function imagePath(path) {
  const match = /^\/images\/(.+)\.jpg$/.exec(path || "");
  return match && optimizedImages.has(match[1])
    ? `/images/${match[1]}.webp`
    : path;
}
export function productCard(product, formatPrice) {
  const e = escapeHTML;
  const sizes = Array.isArray(product.sizes) ? product.sizes : ["STANDARD"];
  return `<article class="gzn-product-card" data-id="${e(product.id)}">
    <div class="card-image-wrap"><button class="product-image-button quick-inspect-trigger" data-id="${e(product.id)}" aria-label="View ${e(product.title)}"><img src="${e(product.image)}" alt="${e(product.title)}" loading="lazy" decoding="async" width="600" height="450" /></button><span class="card-tag-badge">${e(product.tag || categoryName(product.category).toUpperCase())}</span><button class="card-quick-inspect-btn quick-inspect-trigger" data-id="${e(product.id)}" aria-label="Quick view ${e(product.title)}">↗</button></div>
    <div class="card-info"><p class="product-category">${e(categoryName(product.category))}</p><div class="card-title-row"><h3 class="card-title">${e(displayTitle(product))}</h3><span class="card-price">${formatPrice(product.price)}</span></div><label class="product-size">${isApparel(product.category) ? "Size" : "Option"}<select class="card-size-select" aria-label="Choose size for ${e(displayTitle(product))}">${sizes.map((s) => `<option value="${e(s)}" ${s === product.defaultSize ? "selected" : ""}>${e(s)}</option>`).join("")}</select></label><button class="card-add-btn add-to-cart-trigger" data-id="${e(product.id)}" ${product.stock_quantity === 0 ? "disabled" : ""}><span>${product.stock_quantity === 0 ? "Sold out" : "Add to bag"}</span><span aria-hidden="true">+</span></button></div></article>`;
}
