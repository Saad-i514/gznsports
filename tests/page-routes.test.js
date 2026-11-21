import test from 'node:test';
import assert from 'node:assert/strict';
import { pages, pageFromUrl, pageUrl, setPage } from '../src/lib/page-routes.js';

test('clean URLs and existing bookmarks resolve to the same pages', () => {
  for (const page of Object.keys(pages)) {
    assert.equal(pageFromUrl(new URL(`https://store.test/${page}`)), page);
    assert.equal(pageFromUrl(new URL(`https://store.test/${page}/`)), page);
    assert.equal(pageFromUrl(new URL(`https://store.test/?page=${page}`)), page);
  }
  assert.equal(pageFromUrl(new URL('https://store.test/#admin')), 'admin');
  assert.equal(pageFromUrl(new URL('https://store.test/?page=constructor')), '');
  assert.equal(pageUrl(new URL('https://store.test/?page=contact&utm_source=test#admin'), 'admin'), '/admin?utm_source=test');
  assert.equal(pageUrl(new URL('https://store.test/admin'), ''), '/');
  assert.equal(pageUrl(new URL('https://store.test/admin#access_token=example&type=recovery'), 'admin'), '/admin#access_token=example&type=recovery');
});

test('admin navigation and closing update the address without adding duplicate entries', () => {
  const previous = {location: globalThis.location, history: globalThis.history, document: globalThis.document};
  const entries = [];
  const nodes = new Map();
  globalThis.location = new URL('https://store.test/#admin');
  globalThis.history = Object.fromEntries(['pushState', 'replaceState'].map(method => [method, (_state, _title, path) => {
    entries.push([method, path]); globalThis.location = new URL(path, location.origin);
  }]));
  globalThis.document = {
    querySelector: selector => nodes.get(selector),
    createElement: () => ({}),
    head: {append: node => nodes.set(node.name ? `meta[name="${node.name}"]` : `link[rel="${node.rel}"]`, node)},
  };
  try {
    setPage('admin', true);
    setPage('admin');
    assert.deepEqual(entries, [['replaceState', '/admin']]);
    assert.equal(nodes.get('meta[name="robots"]').content, 'noindex, nofollow');
    setPage('');
    assert.equal(location.pathname, '/');
    assert.equal(nodes.get('link[rel="canonical"]').href, 'https://store.test/');
    assert.equal(nodes.get('meta[name="robots"]').content, 'index, follow');
    assert.match(document.title, /Your Day/);
  } finally { Object.assign(globalThis, previous); }
});
