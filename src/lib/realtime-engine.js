// GZNSPORTS // REAL-TIME AUTO-REFRESH ENGINE
import { supabase } from './supabase.js';
import { cacheMemory } from './graphql-client.js';

class RealtimeAutoRefreshEngine {
  constructor() {
    this.channel = null;
    this.status = 'DISCONNECTED'; // 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'
    this.listeners = {
      product: new Set(),
      settings: new Set(),
      order: new Set(),
      status: new Set()
    };
  }

  init() {
    if (this.channel) return;

    this.setStatus('CONNECTING');

    this.channel = supabase
      .channel('gzn-realtime-engine')
      // 1. Listen for Product table changes (INSERT, UPDATE, DELETE)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('⚡ [AutoRefreshEngine] Realtime Product Event:', payload.eventType, payload.new || payload.old);
          // Invalidate GraphQL cache memory for products
          cacheMemory.invalidateByTag('products');
          // Notify listeners
          this.emit('product', payload);
        }
      )
      // 2. Listen for Site Settings changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          console.log('⚡ [AutoRefreshEngine] Realtime Site Settings Event:', payload.eventType, payload.new);
          cacheMemory.invalidateByTag('settings');
          this.emit('settings', payload);
        }
      )
      // 3. Listen for Orders changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('⚡ [AutoRefreshEngine] Realtime Order Event:', payload.eventType, payload.new);
          cacheMemory.invalidateByTag('orders');
          this.emit('order', payload);
        }
      )
      .subscribe((status) => {
        console.log('⚡ [AutoRefreshEngine] Socket status:', status);
        if (status === 'SUBSCRIBED') {
          this.setStatus('CONNECTED');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.setStatus('DISCONNECTED');
        }
      });
  }

  setStatus(status) {
    this.status = status;
    this.emit('status', status);
  }

  getStatus() {
    return this.status;
  }

  onProductChange(fn) {
    this.listeners.product.add(fn);
    return () => this.listeners.product.delete(fn);
  }

  onSettingsChange(fn) {
    this.listeners.settings.add(fn);
    return () => this.listeners.settings.delete(fn);
  }

  onOrderChange(fn) {
    this.listeners.order.add(fn);
    return () => this.listeners.order.delete(fn);
  }

  onStatusChange(fn) {
    this.listeners.status.add(fn);
    fn(this.status);
    return () => this.listeners.status.delete(fn);
  }

  emit(type, payload) {
    const handlers = this.listeners[type];
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (e) {
          console.error(`[AutoRefreshEngine] Error in ${type} listener:`, e);
        }
      });
    }
  }

  destroy() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.setStatus('DISCONNECTED');
    }
  }
}

export const realtimeEngine = new RealtimeAutoRefreshEngine();
