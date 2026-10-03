import { isCurrentCategory } from "../catalog.js";
import { validImage } from "../site-content.js";
export function validateProduct(patch) {
  if ("title" in patch && (!patch.title.trim() || patch.title.length > 200))
    throw new Error("Enter a product title (up to 200 characters).");
  if (
    "price" in patch &&
    (!Number.isFinite(Number(patch.price)) ||
      Number(patch.price) < 0 ||
      patch.price === "")
  )
    throw new Error("Price must be zero or greater.");
  if (
    "stock_quantity" in patch &&
    (!Number.isInteger(Number(patch.stock_quantity)) ||
      Number(patch.stock_quantity) < 0 ||
      patch.stock_quantity === "")
  )
    throw new Error("Stock must be a whole number, zero or greater.");
  if ("category" in patch && !isCurrentCategory(patch.category))
    throw new Error("Choose a valid collection.");
  if ("image" in patch && !validImage(patch.image))
    throw new Error("Use a local /images/ path or HTTPS image URL.");
  if ("sizes" in patch) {
    const sizes = Array.isArray(patch.sizes)
      ? patch.sizes
      : patch.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    if (!sizes.length || sizes.some((s) => typeof s !== "string" || !s.trim()))
      throw new Error("Enter at least one size or edition.");
  }
  if (
    "specs" in patch &&
    (!Array.isArray(patch.specs) ||
      patch.specs.some((s) => !s.label || !s.value))
  )
    throw new Error("Each specification needs a label and value.");
}
export const orderStatuses = [
  "PENDING",
  "PROCESSING",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
];

export function validateSelection(cart, products) {
  const counts = new Map();
  if (!cart.length) throw new Error("Your bag is empty.");
  return cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product)
      throw new Error(
        `${item.title || "A product"} is no longer available. Remove it from your bag.`,
      );
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99 ||
      !product.sizes.includes(item.size)
    )
      throw new Error(
        `Please choose an available size and quantity for ${product.title}.`,
      );
    const count = (counts.get(item.id) || 0) + item.quantity;
    counts.set(item.id, count);
    if (
      Number.isFinite(product.stock_quantity) &&
      count > product.stock_quantity
    )
      throw new Error(
        `Only ${product.stock_quantity} units of ${product.title} are available.`,
      );
    return {
      ...item,
      title: product.title,
      image: product.image,
      price: product.price,
    };
  });
}
