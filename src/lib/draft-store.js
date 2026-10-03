const KEY = "gnz_admin_draft_v1";
const MODE = "gnz_admin_draft_enabled";
export const supportsDraft = () =>
  ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
export const isDraft = () =>
  supportsDraft() && localStorage.getItem(MODE) === "true";
export function enableDraft(products, settings) {
  if (!supportsDraft())
    throw new Error("Draft mode is only available on localhost.");
  if (!localStorage.getItem(KEY))
    localStorage.setItem(
      KEY,
      JSON.stringify({ products, settings, orders: [] }),
    );
  localStorage.setItem(MODE, "true");
}
export function exitDraft() {
  localStorage.removeItem(MODE);
  location.reload();
}
export function createDraftApi(
  storage,
  seed = { products: [], settings: {}, orders: [] },
) {
  const read = () => JSON.parse(storage.getItem(KEY) || JSON.stringify(seed));
  const save = (data) => storage.setItem(KEY, JSON.stringify(data));
  const change = (fn) => {
    const data = read();
    const result = fn(data);
    save(data);
    return structuredClone(result);
  };
  return {
    fetchProducts: async () => read().products,
    fetchSiteSettings: async () => read().settings,
    fetchOrders: async () => read().orders,
    createProduct: async (product) =>
      change((data) => {
        const sizes = Array.isArray(product.sizes)
          ? product.sizes
          : product.sizes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
        const row = {
          ...product,
          id: crypto.randomUUID(),
          price: Number(product.price),
          stock_quantity: Number(product.stock_quantity),
          sizes,
          defaultSize: sizes[0],
          created_at: new Date().toISOString(),
        };
        data.products.unshift(row);
        return row;
      }),
    updateProduct: async (id, patch) =>
      change((data) => {
        const row = data.products.find((p) => p.id === id);
        if (!row) throw new Error("Product no longer exists.");
        Object.assign(row, patch);
        if (typeof row.sizes === "string")
          row.sizes = row.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        row.price = Number(row.price);
        row.stock_quantity = Number(row.stock_quantity);
        row.defaultSize = row.sizes[0];
        return row;
      }),
    deleteProduct: async (id) =>
      change((data) => {
        data.products = data.products.filter((p) => p.id !== id);
        return true;
      }),
    saveSiteSetting: async (key, value) =>
      change((data) => {
        data.settings[key] = value;
        return { key, value };
      }),
    createOrder: async (payload) =>
      change((data) => {
        const row = {
          ...payload,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        };
        data.orders.unshift(row);
        return row;
      }),
    updateOrderStatus: async (id, status) =>
      change((data) => {
        const row = data.orders.find((o) => o.id === id);
        if (!row) throw new Error("Order no longer exists.");
        row.status = status;
        return row;
      }),
    getDashboardMetrics: async () => {
      const data = read();
      return {
        totalRevenue: data.orders
          .filter((o) => o.payment_status === "PAID")
          .reduce((a, o) => a + Number(o.total), 0),
        totalOrders: data.orders.length,
        totalProducts: data.products.length,
        lowStockCount: data.products.filter((p) => p.stock_quantity < 30)
          .length,
        recentOrders: data.orders.slice(0, 5),
      };
    },
  };
}
