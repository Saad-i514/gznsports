export const isGallery = spec => spec?.key==='product_gallery';
const valid = value => typeof value==='string' && (/^\/(?!\/)[^\s]+$/.test(value)||/^https:\/\/[^\s]+$/.test(value));
export function productImages(product) {
  const additional = product.specs?.find(isGallery)?.images || [];
  return [...new Set([product.image,...(Array.isArray(additional)?additional:[])].filter(valid))].slice(0,9);
}
export function withProductGallery(specs, text) {
  const images=[...new Set(text.split('\n').map(s=>s.trim()).filter(Boolean))];
  if(images.length>8 || images.some(image=>!valid(image))) throw new Error('Use up to eight additional HTTPS photo URLs or local /images/ paths.');
  const rest=specs.filter(s=>!isGallery(s));
  return images.length ? [...rest,{key:'product_gallery',label:'Additional photos',value:`${images.length} photos`,images}] : rest;
}

export const isProductGallery = isGallery;
