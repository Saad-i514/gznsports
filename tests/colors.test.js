import test from 'node:test';
import assert from 'node:assert/strict';
import { productColors, withProductColors } from '../src/lib/product-colors.js';
import { validateSelection } from '../src/lib/commerce-validation.js';

test('color configuration preserves other specs and validates selections', () => {
  const material = {label: 'Material', value: 'Cotton'};
  const specs = withProductColors([material, {label: 'Colour', value: 'Blue'}], 'Black, Red, Black');
  const product = {id: 'tee', title: 'Tee', price: 10, sizes: ['M'], specs};
  assert.deepEqual(productColors(product), ['Black', 'Red']);
  assert.deepEqual(withProductColors(specs, ''), [material]);
  assert.deepEqual(productColors({}), ['As pictured']);
  assert.throws(() => withProductColors([], 'x'.repeat(61)), /60 characters/);
  const item = {id: 'tee', size: 'M', quantity: 1, color: 'Red'};
  assert.equal(validateSelection([item], [product])[0].color, 'Red');
  assert.throws(() => validateSelection([{...item, color: 'Blue'}], [product]), /available size, color/);
});
