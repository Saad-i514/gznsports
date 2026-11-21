export const isColor = spec => /^colou?rs?$/i.test(spec?.label?.trim() || '');

export function productColors(product) {
  const value = product.specs?.find(isColor)?.value;
  const colors = typeof value === 'string' ? [...new Set(value.split(',').map(s => s.trim()).filter(Boolean))] : [];
  return colors.length ? colors : ['As pictured'];
}

export function withProductColors(specs, text) {
  const colors = [...new Set(text.split(',').map(s => s.trim()).filter(Boolean))];
  if (colors.length > 30 || colors.some(s => s.length > 60)) throw new Error('Use up to 30 colors, each up to 60 characters.');
  const rest = specs.filter(s => !isColor(s));
  return colors.length ? [...rest, {label: 'Color', value: colors.join(', ')}] : rest;
}
