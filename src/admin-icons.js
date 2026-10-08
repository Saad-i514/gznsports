// Local SVG artwork: consistent geometry, accent fills and no external font dependency.
const drawings = {
  overview: '<rect class="icon-accent" x="3" y="3" width="7" height="8" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="3" y="15" width="7" height="6" rx="2"/><rect class="icon-accent" x="14" y="12" width="7" height="9" rx="2"/>',
  catalog: '<path class="icon-accent" d="m3 7 9-4 9 4-9 4Z"/><path d="M3 7v10l9 4 9-4V7M12 11v10M7.5 5l9 4v5"/>',
  orders: '<path class="icon-accent" d="M6 3h12a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Z"/><path d="M8 7h8M8 11h8m-8 4 2 2 5-4"/>',
  settings: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/><path class="icon-accent" d="m9 12 6 3-6 3Z"/>',
  revenue: '<rect class="icon-accent" x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M7 3v3M17 3v3m-9 10 3-3 3 2 3-3"/>',
  warning: '<path class="icon-accent" d="M10.3 3.8a2 2 0 0 1 3.4 0l8 14A2 2 0 0 1 20 21H4a2 2 0 0 1-1.7-3.2Z"/><path d="M12 9v5M12 17h.01"/>',
  refresh: '<path d="M20 8a8 8 0 0 0-13-3L3 9m0-6v6h6M4 16a8 8 0 0 0 13 3l4-4m-6 0h6v6"/>',
  edit: '<path class="icon-accent" d="m14 4 6 6-10 10-7 1 1-7Z"/><path d="m12 6 6 6m-14 2 6 6m4-16 2-2a2 2 0 0 1 3 0l3 3a2 2 0 0 1 0 3l-2 2"/>',
  delete: '<path class="icon-accent" d="m5 7 1 13h12l1-13Z"/><path d="M3 7h18M9 7V3h6v4M10 11v5M14 11v5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  publish: '<path class="icon-accent" d="m12 3 8 8h-5v7H9v-7H4Z"/><path d="M4 17v4h16v-4"/>',
  announcement: '<path class="icon-accent" d="M3 9h5l12-5v16L8 15H3Z"/><path d="M8 9v6l2 6H6l-2-6M23 9v6"/>',
};
export function adminIcon(name) {
  return `<svg class="admin-svg-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawings[name] || drawings.catalog}</svg>`;
}
