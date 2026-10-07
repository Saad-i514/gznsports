import { validateSelection } from "./commerce-validation.js";
export const nextOrderStatuses = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
export function prepareOrder(payload, products) {
  if (
    !payload.customer_name?.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customer_email || "") ||
    !payload.shipping_address?.address?.trim()
  )
    throw new Error("Provide a name, email and shipping address.");
  if (!Array.isArray(payload.items) || payload.items.length > 50)
    throw new Error("Your bag is invalid.");
  const items = validateSelection(payload.items, products);
  const subtotal =
    Math.round(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100,
    ) / 100;
  const code = (payload.promo_code || "").toUpperCase();
  if (code && !["CHAMPION10", "GENZVIP"].includes(code))
    throw new Error("The discount code is invalid.");
  const discount =
    code === "CHAMPION10"
      ? Math.round(subtotal * 10) / 100
      : code === "GENZVIP"
        ? Math.min(50, subtotal)
        : 0;
  const total = Math.round((subtotal - discount) * 100) / 100;
  if (
    !Number.isFinite(Number(payload.total)) ||
    Math.abs(Number(payload.total) - total) > 0.01
  )
    throw new Error("Prices changed. Review your bag.");
  return {
    ...payload,
    items,
    subtotal,
    discount,
    total,
    shipping_cost: 0,
    status: "PENDING",
    payment_status: "UNPAID",
    inventory_reserved: false,
  };
}
export function transitionDraftOrder(order, status, products) {
  if (order.status === status) return;
  if (!nextOrderStatuses[order.status]?.includes(status))
    throw new Error("Invalid fulfillment transition.");
  if (status === "PROCESSING") {
    validateSelection(order.items, products);
    for (const item of order.items)
      products.find((p) => p.id === item.id).stock_quantity -= item.quantity;
    order.inventory_reserved = true;
  } else if (status === "CANCELLED" && order.inventory_reserved) {
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.id);
      if (product) product.stock_quantity += item.quantity;
    }
    order.inventory_reserved = false;
  }
  order.status = status;
}
