import { isCurrentProduct, currentProduct, categoryName } from "../catalog.js";
import { validateProduct, orderStatuses } from "./commerce-validation.js";
import { requireAdmin } from "./admin-access.js";
import { createDraftApi, isDraft } from "./draft-store.js";
// GZNSPORTS // ADMIN & STORE BACKEND API
import { supabase } from "./supabase.js";
import { imagePath } from "../ui.js";
import { cacheMemory } from "./graphql-client.js";

async function readAllRows(table, order) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    let query = supabase
      .from(table)
      .select("*")
      .order(order, { ascending: false });
    if (order !== "key") query = query.order("id");
    const { data, error } = await query.range(offset, offset + 499);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 500) return rows;
  }
}

const liveApi = {
  // --- PRODUCTS ---
  async fetchProducts(forceFresh = false) {
    if (forceFresh) {
      cacheMemory.invalidateByTag("products");
    }

    const prods = await readAllRows("products", "created_at");

    return prods
      .filter(isCurrentProduct)
      .map(currentProduct)
      .map((p) => {
        let sizes = p.sizes;
        if (typeof sizes === "string") {
          try {
            sizes = JSON.parse(sizes);
          } catch {
            sizes = sizes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
        }
        if (!Array.isArray(sizes) || sizes.length === 0) {
          sizes = ["STANDARD"];
        }

        let specs = p.specs;
        if (typeof specs === "string") {
          try {
            specs = JSON.parse(specs);
          } catch {
            specs = [];
          }
        }
        if (!Array.isArray(specs)) specs = [];

        return {
          ...p,
          image: imagePath(p.image),
          price: parseFloat(p.price) || 0,
          sizes,
          defaultSize:
            p.default_size || p.defaultSize || sizes[0] || "STANDARD",
          categoryName:
            p.category_name ||
            p.categoryName ||
            (p.category ? p.category.toUpperCase() : "OTHERS"),
          specs,
        };
      });
  },

  async createProduct(product) {
    const parsedSizes = Array.isArray(product.sizes)
      ? product.sizes
      : product.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    const newProduct = {
      id: product.id || `gzn-${Date.now()}`,
      title: product.title,
      category: product.category || "hoodies",
      category_name:
        product.category_name || categoryName(product.category || "hoodies"),
      price: parseFloat(product.price) || 0,
      tag: product.tag || "NEW SPECIFICATION",
      rating: parseFloat(product.rating) || 5.0,
      reviews_count: parseInt(product.reviews_count, 10) || 0,
      sizes: Array.isArray(product.sizes)
        ? product.sizes
        : typeof product.sizes === "string"
          ? product.sizes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : ["STANDARD"],
      default_size: product.default_size || parsedSizes[0] || "STANDARD",
      image: product.image || "/images/hoodies/genz-heavyweight-hoodie.webp",
      description: product.description || "",
      specs: Array.isArray(product.specs) ? product.specs : [],
      stock_quantity: Number.isFinite(parseInt(product.stock_quantity, 10))
        ? Math.max(0, parseInt(product.stock_quantity, 10))
        : 50,
      is_featured: !!product.is_featured,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("products")
      .insert([newProduct])
      .select()
      .single();

    if (error) throw error;
    cacheMemory.invalidateByTag("products");
    return data;
  },

  async updateProduct(id, updates) {
    const formatted = { ...updates, updated_at: new Date().toISOString() };
    if (formatted.category && !formatted.category_name)
      formatted.category_name = categoryName(formatted.category);
    if (formatted.price !== undefined)
      formatted.price = parseFloat(formatted.price);
    if (formatted.stock_quantity !== undefined)
      formatted.stock_quantity = parseInt(formatted.stock_quantity, 10);
    if (typeof formatted.sizes === "string") {
      formatted.sizes = formatted.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (formatted.sizes) formatted.default_size = formatted.sizes[0];

    const { data, error } = await supabase
      .from("products")
      .update(formatted)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    cacheMemory.invalidateByTag("products");
    return data;
  },

  async deleteProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;
    cacheMemory.invalidateByTag("products");
    return true;
  },

  // --- SITE SETTINGS & CONTENT CUSTOMIZATION ---
  async fetchSiteSettings(forceFresh = false) {
    if (forceFresh) {
      cacheMemory.invalidateByTag("settings");
    }

    const data = await readAllRows("site_settings", "key");
    const settings = {};
    (data || []).forEach((row) => {
      settings[row.key] = row.value;
    });
    return settings;
  },

  async saveSiteSetting(key, value) {
    const { data, error } = await supabase
      .from("site_settings")
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    cacheMemory.invalidateByTag("settings");
    return data;
  },

  // --- ORDERS & TRANSACTIONS ---
  async fetchOrders() {
    return readAllRows("orders", "created_at");
  },

  async updateOrderStatus(orderId, status) {
    const { data, error } = await supabase.rpc("transition_order", {
      order_id: orderId,
      next_status: status,
    });

    if (error) throw error;
    cacheMemory.invalidateByTag("orders");
    return data;
  },

  async createOrder(orderPayload) {
    const { data, error } = await supabase.rpc("submit_order_request", {
      payload: orderPayload,
    });
    if (error) {
      if (error.code === "PGRST202")
        throw new Error(
          "Online order requests are being configured. Please contact the store using the email or phone in the footer. Your bag is saved.",
        );
      throw error;
    }
    return data;
  },

  // --- DASHBOARD METRICS ---
  async uploadProductImage(file) {
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    )
      throw new Error("Choose a JPEG, PNG or WebP image smaller than 5 MB.");
    const ext = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }[file.type];
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    return supabase.storage.from("product-images").getPublicUrl(path).data
      .publicUrl;
  },
  async getDashboardMetrics() {
    const [products, orders] = await Promise.all([
      this.fetchProducts(false),
      this.fetchOrders(),
    ]);

    const totalRevenue = orders
      .filter((o) => o.payment_status === "PAID" && o.status !== "CANCELLED")
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const lowStockCount = products.filter(
      (p) => (p.stock_quantity || 0) < 30,
    ).length;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      lowStockCount,
      recentOrders: orders.slice(0, 5),
    };
  },
};

const protectedMethods = new Set([
  "uploadProductImage",
  "createProduct",
  "updateProduct",
  "deleteProduct",
  "saveSiteSetting",
  "fetchOrders",
  "updateOrderStatus",
  "getDashboardMetrics",
]);
const mutations = new Set([
  "createProduct",
  "updateProduct",
  "deleteProduct",
  "saveSiteSetting",
  "updateOrderStatus",
  "createOrder",
]);
export const adminApi = new Proxy(liveApi, {
  get(target, method) {
    if (typeof target[method] !== "function") return target[method];
    return async (...args) => {
      if (method === "createProduct") validateProduct(args[0]);
      if (method === "updateProduct") validateProduct(args[1]);
      if (method === "updateOrderStatus" && !orderStatuses.includes(args[1]))
        throw new Error("Invalid order status.");
      const draft = isDraft();
      if (draft && method === "uploadProductImage")
        throw new Error(
          "Image uploads require live admin mode. Use a local image path in the draft editor.",
        );
      if (!draft && protectedMethods.has(method)) await requireAdmin();
      const api = draft ? createDraftApi(localStorage) : target;
      const result = await api[method](...args);
      if (mutations.has(method))
        window.dispatchEvent(
          new CustomEvent("gnz:data-changed", { detail: { method } }),
        );
      return result;
    };
  },
});
