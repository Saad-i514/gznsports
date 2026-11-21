import test from 'node:test';
import assert from 'node:assert/strict';
import {formattedText, editorValue} from '../src/lib/formatted-text.js';
import {normalizeSizes} from '../src/admin-sizes.js';
import {withProductColors, productColors} from '../src/lib/product-colors.js';

test('formatted copy preserves emphasis and line breaks while escaping executable HTML', () => {
  assert.equal(formattedText('Soft <b>cotton & <i>comfort</i></b>\nEvery day'), 'Soft <strong>cotton & <em>comfort</em></strong><br>Every day'.replace('cotton & ', 'cotton &amp; '));
  for (const unsafe of ['<img src=x onerror=alert(1)>', '<strong onclick="alert(1)">text</strong>', '<script>alert(1)</script>', '<a href="javascript:alert(1)">link</a>']) {
    assert.ok(!/<(?:img|script|a|strong\s)/.test(formattedText(unsafe)));
  }
  assert.equal(formattedText('Cotton & wool'), 'Cotton &amp; wool');
});

test('editor serialization retains bold/italic and omits attributes', () => {
  const text = value => ({nodeType:3, textContent:value});
  const node = (tag, children) => ({nodeType:1, nodeName:tag, childNodes:children});
  const saved = editorValue(node('B', [text('Soft '), node('I',[text('cotton & wool')])]));
  assert.equal(saved, '<strong>Soft <em>cotton & wool</em></strong>');
  assert.equal(formattedText(saved), '<strong>Soft <em>cotton &amp; wool</em></strong>');
  assert.equal(editorValue(node('DIV',[text('Next line')])), '\nNext line');
});

test('color picker values preserve multiword and custom colors through save and reload', () => {
  const colors = normalizeSizes(['Black', 'Red', 'Navy blue', 'Red']);
  const specs = withProductColors([], colors.join(', '));
  assert.deepEqual(productColors({specs}), ['Black', 'Red', 'Navy blue']);
  assert.deepEqual(normalizeSizes('Black Red Yellow'), ['Black Red Yellow']);
  assert.deepEqual(productColors({specs:withProductColors(specs, '')}), ['As pictured']);
});
