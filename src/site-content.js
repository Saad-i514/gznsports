import { escapeHTML } from "./ui.js";

// One schema drives the editor and the public page. Values are text, never HTML.
export const contentFields = [
  ["contact_email", "Contact email", "#contact-email", "email"],
  ["contact_phone", "Contact phone", "#contact-phone", "phone"],
  ["hero_image", "Hero photograph", ".hero-art img", "image"],
  [
    "tracksuits_image",
    "Tracksuit collection image",
    '.collection-card[data-category="tracksuits"] img',
    "image",
  ],
  [
    "hoodies_image",
    "Hoodie collection photograph",
    '.collection-card[data-category="hoodies"] img',
    "image",
  ],
  ...["tshirts", "fashion", "bags", "others"].map((id) => [
    id + "_image",
    id === "tshirts"
      ? "T-shirt collection image"
      : id.charAt(0).toUpperCase() + id.slice(1) + " collection image",
    `.collection-card[data-category="${id}"] img`,
    "image",
  ]),
  ["craft_image", "Garment detail photograph", ".studio-fallback", "image"],
  [
    "editorial_image",
    "Hoodie editorial photograph",
    ".editorial-image img",
    "image",
  ],
  ["collections_title", "Collection heading", ".collections-section h2"],
  ["collections_intro", "Collection introduction", ".section-intro"],
  ["catalog_title", "Catalog heading", "#catalog-title"],
  ["craft_title", "Craft heading", "#craft-title"],
  ["craft_intro", "Craft introduction", ".craft-copy > p:not(.eyebrow)"],
  ["hoodie_title", "Hoodie heading", "#hoodie-title"],
  ["hoodie_intro", "Hoodie introduction", ".editorial-copy > p:not(.eyebrow)"],
  ["story_title", "Brand story heading", ".mindset-section h2"],
  ["story_body", "Brand story", ".mindset-bottom > p"],
  ["cta_title", "Final call to action heading", ".final-cta h2"],
  ["footer_copy", "Footer introduction", ".footer-main > p"],
  ["hoodie_fit", "FAQ: hoodie fit", "#faq-modal .faq-item:nth-child(1) .faq-a"],
  [
    "size_guide",
    "FAQ: sizes and measurements",
    "#faq-modal .faq-item:nth-child(2) .faq-a",
  ],
  [
    "care",
    "FAQ: care instructions",
    "#faq-modal .faq-item:nth-child(3) .faq-a",
  ],
  [
    "ordering",
    "FAQ: order process",
    "#faq-modal .faq-item:nth-child(4) .faq-a",
  ],
  ["policy", "Shipping, returns and store policies", "#legal-modal-body"],
];

export function validImage(value) {
  return (
    typeof value === "string" &&
    (/^\/(?!\/)[^\s]+$/.test(value) || /^https:\/\/[^\s]+$/.test(value))
  );
}
export function applyContent(values = {}) {
  for (const [key, , selector, type] of contentFields) {
    const node = document.querySelector(selector);
    if (!node || typeof values[key] !== "string") continue;
    if (type === "image") {
      if (validImage(values[key])) node.src = values[key];
    } else if (type === "email") {
      node.textContent = values[key];
      node.href = "mailto:" + values[key];
    } else if (type === "phone") {
      node.textContent = values[key];
      node.href = "tel:" + values[key].replace(/[^+0-9]/g, "");
    } else node.textContent = values[key];
  }
}
export function contentEditor(values = {}) {
  return `<form id="page-content-form" class="admin-form-grid">${contentFields
    .map(([key, label, selector, type]) => {
      const node = document.querySelector(selector);
      const value =
        values[key] ??
        (type === "image"
          ? node?.getAttribute("src")
          : node?.innerText || node?.textContent) ??
        "";
      return `<div class="form-group full-width"><label for="content-${key}">${label}</label>${type === "image" ? `<input id="content-${key}" name="${key}" value="${escapeHTML(value)}" required /><small>Use a /images/ path or an HTTPS image URL.</small>` : `<textarea id="content-${key}" name="${key}" rows="3" maxlength="4000">${escapeHTML(value)}</textarea>`}</div>`;
    })
    .join(
      "",
    )}<p id="content-feedback" role="status"></p><div class="form-actions full-width"><button type="submit" class="btn-primary">Save page content</button></div></form>`;
}
