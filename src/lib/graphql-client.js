// GZNSPORTS // BROWSER GRAPHQL ENGINE & CACHE MEMORY SYSTEM
import { SUPABASE_CONFIG } from "./supabase.js";

class GraphQLCacheMemory {
  constructor(storageKey = "gzn_graphql_cache") {
    this.storageKey = storageKey;
    this.memoryCache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
    this.loadPersistentCache();
  }

  loadPersistentCache() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        const now = Date.now();
        Object.entries(parsed).forEach(([key, record]) => {
          if (record && record.expiresAt > now) {
            this.memoryCache.set(key, record);
          }
        });
      }
    } catch (e) {
      console.warn("[CacheMemory] Failed to load localStorage cache:", e);
    }
  }

  savePersistentCache() {
    try {
      const obj = {};
      const now = Date.now();
      this.memoryCache.forEach((record, key) => {
        if (record && record.expiresAt > now) {
          obj[key] = record;
        }
      });
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
    } catch (e) {
      console.warn("[CacheMemory] Failed to persist cache:", e);
    }
  }

  hashKey(query, variables = {}) {
    const raw = `${query.trim()}:${JSON.stringify(variables)}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `gql_${Math.abs(hash)}`;
  }

  get(key) {
    const record = this.memoryCache.get(key);
    if (!record) return null;

    const isExpired = Date.now() > record.expiresAt;
    return {
      data: record.data,
      isExpired,
      cachedAt: record.cachedAt,
      tags: record.tags || [],
    };
  }

  set(key, data, { ttl = this.defaultTTL, tags = [] } = {}) {
    const record = {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttl,
      tags,
    };
    this.memoryCache.set(key, record);
    this.savePersistentCache();
  }

  invalidateByTag(tag) {
    let count = 0;
    this.memoryCache.forEach((record, key) => {
      if (record.tags && record.tags.includes(tag)) {
        this.memoryCache.delete(key);
        count++;
      }
    });
    this.savePersistentCache();
    console.log(`[CacheMemory] Invalidated ${count} queries with tag: ${tag}`);
    return count;
  }

  clear() {
    this.memoryCache.clear();
    try {
      localStorage.removeItem(this.storageKey);
    } catch {}
    console.log("[CacheMemory] Cleared all cache memory");
  }
}

export const cacheMemory = new GraphQLCacheMemory();

/**
 * Execute a GraphQL query with Browser Cache Memory & Stale-While-Revalidate (SWR)
 */
export async function executeGraphQL(query, variables = {}, options = {}) {
  const {
    useCache = true,
    ttl = 60000,
    tags = ["products"],
    onRevalidated = null,
  } = options;

  const key = cacheMemory.hashKey(query, variables);

  // 1. Check Cache
  if (useCache) {
    const cached = cacheMemory.get(key);
    if (cached) {
      // If valid, return cached data immediately (instant 0ms render)
      if (!cached.isExpired) {
        return cached.data;
      }

      // If expired, return stale data immediately and revalidate in background (SWR pattern)
      fetchFromNetwork(query, variables)
        .then((freshData) => {
          if (freshData) {
            cacheMemory.set(key, freshData, { ttl, tags });
            if (typeof onRevalidated === "function") {
              onRevalidated(freshData);
            }
          }
        })
        .catch((error) =>
          console.warn(
            "[CacheMemory] Background refresh failed:",
            error.message,
          ),
        );
      return cached.data;
    }
  }

  // 2. Fetch fresh from Supabase GraphQL endpoint
  const freshData = await fetchFromNetwork(query, variables);
  if (useCache && freshData) {
    cacheMemory.set(key, freshData, { ttl, tags });
  }
  return freshData;
}

async function fetchFromNetwork(query, variables = {}) {
  const url = `${SUPABASE_CONFIG.url}/graphql/v1`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_CONFIG.publishableKey,
      Authorization: `Bearer ${SUPABASE_CONFIG.publishableKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors && result.errors.length > 0) {
    console.error("[GraphQL Network Error]:", result.errors);
    throw new Error(
      result.errors[0].message || "GraphQL Query Execution Error",
    );
  }

  return result.data;
}

// Pre-defined GraphQL query strings
export const GQL_QUERIES = {
  GET_ALL_PRODUCTS: `
    query GetAllProducts {
      productsCollection(orderBy: [{ created_at: DescNullsLast }]) {
        edges {
          node {
            id
            title
            category
            category_name
            price
            tag
            rating
            reviews_count
            sizes
            default_size
            image
            description
            specs
            stock_quantity
            is_featured
            created_at
            updated_at
          }
        }
      }
    }
  `,

  GET_PRODUCT_BY_ID: `
    query GetProductById($id: String!) {
      productsCollection(filter: { id: { eq: $id } }, first: 1) {
        edges {
          node {
            id
            title
            category
            category_name
            price
            tag
            rating
            reviews_count
            sizes
            default_size
            image
            description
            specs
            stock_quantity
            is_featured
          }
        }
      }
    }
  `,

  GET_SITE_SETTINGS: `
    query GetSiteSettings {
      site_settingsCollection {
        edges {
          node {
            key
            value
            updated_at
          }
        }
      }
    }
  `,
};
