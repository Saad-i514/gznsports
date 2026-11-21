export const pages = {
  admin: 'Store manager', contact: 'Contact & support', tracking: 'Track your order',
  shipping: 'Shipping & delivery', returns: 'Returns & refunds', privacy: 'Privacy policy',
  terms: 'Terms of sale', promotions: 'Promotion terms',
};
export const pageDescription = page => page === 'contact'
  ? 'Contact GZNSPORTS for product questions, order support and store information.'
  : pages[page] ? `${pages[page]} for GZNSPORTS clothing and accessories.`
  : 'GZNSPORTS — Hoodies, tracksuits, T-shirts, fashion, bags and everyday essentials. Your day. Your way.';

export function pageFromUrl(url) {
  if (url.hash === '#admin') return 'admin';
  const legacy = url.searchParams.get('page');
  if (Object.hasOwn(pages, legacy)) return legacy;
  const path = url.pathname.replace(/^\/|\/$/g, '');
  return Object.hasOwn(pages, path) ? path : '';
}

export function pageUrl(url, page) {
  const next = new URL(url);
  next.pathname = Object.hasOwn(pages, page) ? `/${page}` : '/';
  next.searchParams.delete('page');
  if (next.hash === '#admin') next.hash = '';
  return next.pathname + next.search + next.hash;
}

export function setPage(page, replace = false) {
  const next = pageUrl(new URL(location.href), page);
  if (next !== location.pathname + location.search + location.hash)
    history[replace ? 'replaceState' : 'pushState'](null, '', next);
  document.title = pages[page] ? `${pages[page]} | GZNSPORTS` : 'GZNSPORTS — Your Day. Your Way.';
  document.querySelector('meta[name="description"]')?.setAttribute('content', pageDescription(page));
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', pageDescription(page));
  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.append(robots); }
  robots.content = ['admin', 'tracking'].includes(page) ? 'noindex, nofollow' : 'index, follow';
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
  canonical.href = location.origin + (page ? `/${page}` : '/');
}
