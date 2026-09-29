// GZNSPORTS // ADMIN & STORE BACKEND API
import { supabase } from './supabase.js';
import { executeGraphQL, GQL_QUERIES, cacheMemory } from './graphql-client.js';

export const adminApi = {
  // --- PRODUCTS ---
  async fetchProducts(forceFresh = false) {
    if (forceFresh) {
      cacheMemory.invalidateByTag('products');
    }

    try {
      const data = await executeGraphQL(GQL_QUERIES.GET_ALL_PRODUCTS, {}, {
        useCache: !forceFresh,
        ttl: 60000,
        tags: ['products']
      });

      if (data?.productsCollection?.edges) {
        return data.productsCollection.edges.map(e => e.node);
      }
    } catch (e) {
      console.warn('[AdminAPI] GraphQL query failed, falling back to REST:', e);
    }

    // Fallback to Supabase REST
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createProduct(product) {
    const newProduct = {
      id: product.id || `gzn-${Date.now()}`,
      title: product.title,
      category: product.category || 'striking',
      category_name: product.category_name || (product.category === 'striking' ? 'STRIKING // BOXING' : 'MMA // COMBAT'),
      price: parseFloat(product.price) || 0,
      tag: product.tag || 'NEW SPECIFICATION',
      rating: parseFloat(product.rating) || 5.0,
      reviews_count: parseInt(product.reviews_count, 10) || 0,
      sizes: Array.isArray(product.sizes) ? product.sizes : (typeof product.sizes === 'string' ? product.sizes.split(',').map(s => s.trim()).filter(Boolean) : ['STANDARD']),
      default_size: product.default_size || (Array.isArray(product.sizes) && product.sizes[0]) || 'STANDARD',
      image: product.image || '/images/gear-macro.jpg',
      description: product.description || '',
      specs: Array.isArray(product.specs) ? product.specs : [],
      stock_quantity: parseInt(product.stock_quantity, 10) || 50,
      is_featured: !!product.is_featured,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) throw error;
    cacheMemory.invalidateByTag('products');
    return data;
  },

  async updateProduct(id, updates) {
    const formatted = { ...updates, updated_at: new Date().toISOString() };
    if (formatted.price !== undefined) formatted.price = parseFloat(formatted.price);
    if (formatted.stock_quantity !== undefined) formatted.stock_quantity = parseInt(formatted.stock_quantity, 10);
    if (typeof formatted.sizes === 'string') {
      formatted.sizes = formatted.sizes.split(',').map(s => s.trim()).filter(Boolean);
    }

    const { data, error } = await supabase
      .from('products')
      .update(formatted)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    cacheMemory.invalidateByTag('products');
    return data;
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    cacheMemory.invalidateByTag('products');
    return true;
  },

  // --- SITE SETTINGS & CONTENT CUSTOMIZATION ---
  async fetchSiteSettings(forceFresh = false) {
    if (forceFresh) {
      cacheMemory.invalidateByTag('settings');
    }

    try {
      const data = await executeGraphQL(GQL_QUERIES.GET_SITE_SETTINGS, {}, {
        useCache: !forceFresh,
        ttl: 120000,
        tags: ['settings']
      });

      if (data?.site_settingsCollection?.edges) {
        const settings = {};
        data.site_settingsCollection.edges.forEach(e => {
          settings[e.node.key] = e.node.value;
        });
        return settings;
      }
    } catch (e) {
      console.warn('[AdminAPI] GraphQL settings query failed, falling back to REST:', e);
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) throw error;
    const settings = {};
    (data || []).forEach(row => {
      settings[row.key] = row.value;
    });
    return settings;
  },

  async saveSiteSetting(key, value) {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    cacheMemory.invalidateByTag('settings');
    return data;
  },

  // --- ORDERS & TRANSACTIONS ---
  async fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateOrderStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    cacheMemory.invalidateByTag('orders');
    return data;
  },

  async createOrder(orderPayload) {
    const sub = parseFloat(orderPayload.subtotal || orderPayload.total_amount || orderPayload.total || 0);
    const ship = parseFloat(orderPayload.shipping_cost || 0);
    const disc = parseFloat(orderPayload.discount || 0);
    const tot = parseFloat(orderPayload.total || orderPayload.total_amount || (sub + ship - disc));

    const newOrder = {
      customer_name: orderPayload.customer_name || (orderPayload.customer_email ? orderPayload.customer_email.split('@')[0] : 'Combat Athlete'),
      customer_email: orderPayload.customer_email || 'athlete@gznsports.com',
      customer_phone: orderPayload.customer_phone || '',
      items: orderPayload.items || [],
      subtotal: sub,
      shipping_cost: ship,
      discount: disc,
      total: tot,
      status: (orderPayload.status || 'PENDING').toUpperCase(),
      payment_status: (orderPayload.payment_status || 'PAID').toUpperCase(),
      shipping_address: orderPayload.shipping_address || {},
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) throw error;
    cacheMemory.invalidateByTag('orders');
    return data;
  },

  // --- DASHBOARD METRICS ---
  async getDashboardMetrics() {
    const [products, orders] = await Promise.all([
      this.fetchProducts(false),
      this.fetchOrders()
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => (p.stock_quantity || 0) < 30).length;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      lowStockCount,
      recentOrders: orders.slice(0, 5)
    };
  }
};
