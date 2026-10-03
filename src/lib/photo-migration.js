const names = new Set([
  "hoodies",
  "tracksuits",
  "tshirts",
  "fashion",
  "bags",
  "others",
  "duffel",
  "socks",
]);
export function photoPath(path) {
  const match = /^\/images\/samples\/([a-z]+)\.svg$/.exec(path || "");
  if (match && names.has(match[1])) return `/images/photos/${match[1]}.jpg`;
  if (
    /^\/images\/hoodies\/genz-(heavyweight|zip|raw-cut)-hoodie\.webp$/.test(
      path || "",
    )
  )
    return "/images/photos/hoodies.jpg";
  return path;
}
export function migrateDraftPhotos(draft) {
  for (const product of draft.products || [])
    product.image = photoPath(product.image);
  const content = draft.settings?.page_content;
  if (content)
    for (const key of Object.keys(content))
      if (key.endsWith("_image")) content[key] = photoPath(content[key]);
  return draft;
}
