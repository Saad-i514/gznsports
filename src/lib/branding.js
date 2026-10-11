// Normalize old display copy without renaming stored IDs, URLs or storage keys.
export const correctBranding = (value) =>
  typeof value === "string"
    ? value.replace(/\bgnzsports\b/gi, "GZNSPORTS").replace(/\bgnz\b/gi, "GZN")
    : value;

export function brandProduct(product) {
  return {
    ...product,
    title: correctBranding(product.title),
    description: correctBranding(product.description),
    tag: correctBranding(product.tag),
    specs: Array.isArray(product.specs)
      ? product.specs.map((spec) => ({
          ...spec,
          label: correctBranding(spec.label),
          value: correctBranding(spec.value),
        }))
      : product.specs,
  };
}

export function brandSettings(settings) {
  const result = { ...settings };
  for (const group of ["page_content", "hero_config", "announcements"]) {
    if (!settings[group] || typeof settings[group] !== "object") continue;
    result[group] = Object.fromEntries(
      Object.entries(settings[group]).map(([key, value]) => [
        key,
        /image|email|phone|url|path|direction|^_/.test(key)
          ? value
          : correctBranding(value),
      ]),
    );
  }
  return result;
}
