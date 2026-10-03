export const CATEGORIES = [
  {
    id: "hoodies",
    name: "Hoodies",
    copy: "Your everyday layer.",
    symbol: "01",
  },
  {
    id: "tracksuits",
    name: "Tracksuits",
    copy: "Move through your day.",
    symbol: "02",
  },
  {
    id: "tshirts",
    name: "T-shirts",
    copy: "The foundation of your fit.",
    symbol: "03",
  },
  { id: "fashion", name: "Fashion", copy: "Make it your own.", symbol: "04" },
  { id: "bags", name: "Bags", copy: "Carry your essentials.", symbol: "05" },
  {
    id: "others",
    name: "Others",
    copy: "The finishing touches.",
    symbol: "06",
  },
];
export const categoryName = (id) =>
  CATEGORIES.find((c) => c.id === id)?.name || "Others";
export const isCurrentCategory = (id) => CATEGORIES.some((c) => c.id === id);
export const isApparel = (id) =>
  ["hoodies", "tracksuits", "tshirts", "fashion"].includes(id);
// Exclude the retired collection even if a legacy database record has been recategorized.
export const isCurrentProduct = (p) =>
  isCurrentCategory(p.category) &&
  !/\bbelts?\b/i.test(`${p.id} ${p.title} ${p.description || ""}`);
export const CURRENT_DIRECTION = "everyday-2026";
export function currentProduct(product) {
  const names = {
    "genz-hoodie-heavyweight-450": "GNZSPORTS Apex Heavyweight Hoodie",
    "genz-hoodie-raw-cut": "GNZSPORTS Raw-Cut Hoodie",
    "genz-hoodie-zip-championship": "GNZSPORTS Full-Zip Hoodie",
  };
  const legacy =
    names[product.id] && /GENZ|Combat|Championship/i.test(product.title);
  return legacy
    ? {
        ...product,
        title: names[product.id],
        tag: "EVERYDAY ESSENTIAL",
        description:
          "A considered everyday layer with a relaxed silhouette. Explore the available sizes and product specifications before ordering.",
      }
    : product;
}
