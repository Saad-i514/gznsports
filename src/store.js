import { SAMPLE_PRODUCTS } from "./sample-products.js";
import { isCurrentProduct, currentProduct } from "./catalog.js";
// GENZ SPORTS E-Commerce Store & Product Catalog
import { playPunchImpact, playMetallicClick } from "./audio.js";

export const PRODUCTS = structuredClone(SAMPLE_PRODUCTS);

class Store {
  constructor() {
    this.cart = this.loadCart();
    this.listeners = [];
    this.currency = "USD";
    this.rates = {
      USD: 1.0,
      GBP: 0.79,
      EUR: 0.92,
      CAD: 1.36,
      AUD: 1.52,
    };
    this.symbols = {
      USD: "$",
      GBP: "£",
      EUR: "€",
      CAD: "CA$",
      AUD: "A$",
    };
    this.discountCode = null;
    this.discountPercent = 0;
    this.discountAmount = 0;
  }

  setCurrency(cur) {
    if (this.rates[cur]) {
      this.currency = cur;
      this.notify();
    }
  }

  getCurrency() {
    return this.currency;
  }

  getCurrencySymbol() {
    return this.symbols[this.currency] || "$";
  }

  formatPrice(amountInUSD) {
    const rate = this.rates[this.currency] || 1.0;
    const symbol = this.getCurrencySymbol();
    const converted = amountInUSD * rate;
    return `${symbol}${converted.toFixed(2)}`;
  }

  applyPromoCode(code) {
    const clean = (code || "").trim().toUpperCase();
    if (clean === "CHAMPION10") {
      this.discountCode = clean;
      this.discountPercent = 10;
      this.discountAmount = 0;
      this.notify();
      return { success: true, message: "10% Champion Discount Applied!" };
    } else if (clean === "GENZVIP") {
      this.discountCode = clean;
      this.discountPercent = 0;
      this.discountAmount = 50;
      this.notify();
      return { success: true, message: "$50 VIP Combat Credit Applied!" };
    }
    return { success: false, message: "Invalid or expired promotional code." };
  }

  removePromoCode() {
    this.discountCode = null;
    this.discountPercent = 0;
    this.discountAmount = 0;
    this.notify();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem("gzn_cart");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed
            .filter(
              (item) =>
                item &&
                typeof item.id === "string" &&
                !/belt/i.test(item.id + " " + item.title) &&
                typeof item.title === "string" &&
                typeof item.size === "string" &&
                Number.isFinite(item.price) &&
                item.price >= 0 &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0,
            )
            .map((item) => ({ ...item, quantity: Math.min(item.quantity, 99) }))
        : [];
    } catch {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem("gzn_cart", JSON.stringify(this.cart));
    } catch (e) {
      console.warn("Storage save failed:", e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((fn) => fn(this.cart));
  }

  addToCart(productId, size = null, quantity = 1) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (
      !product ||
      product.stock_quantity === 0 ||
      !Number.isInteger(quantity) ||
      quantity < 1
    )
      return false;

    const chosenSize = size || product.defaultSize || "STANDARD";
    if (!product.sizes.includes(chosenSize)) return false;
    const total = this.cart
      .filter((item) => item.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (total + quantity > Math.min(99, product.stock_quantity ?? 99))
      return false;
    const existingIndex = this.cart.findIndex(
      (item) => item.id === productId && item.size === chosenSize,
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity = Math.min(
        99,
        this.cart[existingIndex].quantity + quantity,
      );
    } else {
      this.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        size: chosenSize,
        image: product.image,
        quantity: quantity,
      });
    }

    playPunchImpact();
    this.saveCart();
    return true;
  }

  removeFromCart(id, size) {
    this.cart = this.cart.filter(
      (item) => !(item.id === id && item.size === size),
    );
    playMetallicClick();
    this.saveCart();
  }

  updateQuantity(id, size, delta) {
    const item = this.cart.find((item) => item.id === id && item.size === size);
    if (!item) return;

    if (!Number.isInteger(delta)) return;
    const product = PRODUCTS.find((p) => p.id === id);
    const total = this.cart
      .filter((row) => row.id === id)
      .reduce((sum, row) => sum + row.quantity, 0);
    if (
      delta > 0 &&
      (!product || total + delta > Math.min(99, product.stock_quantity ?? 99))
    )
      return;
    item.quantity = Math.min(99, item.quantity + delta);
    if (item.quantity <= 0) {
      this.removeFromCart(id, size);
    } else {
      playMetallicClick();
      this.saveCart();
    }
  }

  getCartCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartSubtotal() {
    return this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }

  getCartDiscount() {
    const subtotal = this.getCartSubtotal();
    if (this.discountPercent > 0) {
      return (subtotal * this.discountPercent) / 100;
    }
    if (this.discountAmount > 0) {
      return Math.min(subtotal, this.discountAmount);
    }
    return 0;
  }

  getCartTotal() {
    const subtotal = this.getCartSubtotal();
    const discount = this.getCartDiscount();
    return Math.max(0, subtotal - discount);
  }

  getFreeShippingProgress() {
    const threshold = this.shippingThreshold || 100;
    const subtotal = this.getCartSubtotal();
    const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
    const remaining = Math.max(0, threshold - subtotal);
    return {
      threshold,
      subtotal,
      percent,
      remaining,
      unlocked: remaining === 0,
    };
  }

  setProducts(newProducts) {
    if (!Array.isArray(newProducts)) return;
    PRODUCTS.splice(
      0,
      PRODUCTS.length,
      ...newProducts.filter(isCurrentProduct).map(currentProduct),
    );
    this.cart = this.cart.filter((item) =>
      PRODUCTS.some((product) => product.id === item.id),
    );
    this.notify();
  }

  getProducts() {
    return PRODUCTS;
  }

  clearCart() {
    this.cart = [];
    this.discountCode = null;
    this.discountPercent = 0;
    this.discountAmount = 0;
    this.saveCart();
  }
}

export const store = new Store();
