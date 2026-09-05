/**
 * In-Memory High Performance Cache Manager
 * 
 * Features:
 * 1. Single-Flight Request Deduplication: Collapses 1,000 concurrent calls for the same key into 1 single fetch.
 * 2. Stale-While-Revalidate (SWR): Returns cached data instantly (<2ms) while refreshing in the background if expired.
 * 3. Tag-based & Prefix-based Cache Invalidation.
 * 4. Quota protection for Google Sheets API.
 */

import { after } from "next/server";

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  freshUntil: number;
  staleUntil: number;
  tag?: string;
}

class InMemoryCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();

  // Default: Fresh for 5 minutes, Stale-While-Revalidate allowed for up to 60 minutes
  private readonly DEFAULT_FRESH_MS = 5 * 60 * 1000;
  private readonly DEFAULT_STALE_MS = 60 * 60 * 1000;

  /**
   * Fetch with cache + single-flight deduplication
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      freshMs?: number;
      staleMs?: number;
      tag?: string;
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    const now = Date.now();
    const freshMs = options?.freshMs ?? this.DEFAULT_FRESH_MS;
    const staleMs = options?.staleMs ?? this.DEFAULT_STALE_MS;
    const forceRefresh = options?.forceRefresh ?? false;

    const existing = this.cache.get(key);

    // 1. Return immediately if fresh
    if (existing && !forceRefresh && now < existing.freshUntil) {
      return existing.data as T;
    }

    // 2. If stale but within SWR window, return stale data immediately and refresh in background
    if (existing && !forceRefresh && now < existing.staleUntil) {
      // Trigger background refresh if not already in flight
      if (!this.inFlight.has(key)) {
        let scheduledWithAfter = false;
        try {
          after(async () => {
            try {
              await this.executeFetch(key, fetcher, freshMs, staleMs, options?.tag);
            } catch (err: any) {
              if (!err?.message?.includes("EPIPE") && !err?.message?.includes("ECONNRESET")) {
                console.warn(`[CacheManager] Background SWR refresh failed for ${key}:`, err?.message || err);
              }
            }
          });
          scheduledWithAfter = true;
        } catch {
          // If called outside of a request scope (e.g. CLI scripts/build), fallback to standard promise
        }

        if (!scheduledWithAfter) {
          this.executeFetch(key, fetcher, freshMs, staleMs, options?.tag).catch((err: any) => {
            if (!err?.message?.includes("EPIPE") && !err?.message?.includes("ECONNRESET")) {
              console.warn(`[CacheManager] Background SWR refresh failed for ${key}:`, err?.message || err);
            }
          });
        }
      }
      return existing.data as T;
    }

    // 3. Cache miss or force refresh: Use single-flight deduplication
    const activePromise = this.inFlight.get(key);
    if (activePromise && !forceRefresh) {
      return activePromise as Promise<T>;
    }

    // Launch fetch
    return this.executeFetch(key, fetcher, freshMs, staleMs, options?.tag);
  }

  private async executeFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    freshMs: number,
    staleMs: number,
    tag?: string
  ): Promise<T> {
    const fetchPromise = (async () => {
      try {
        const result = await fetcher();
        const now = Date.now();
        this.cache.set(key, {
          data: result,
          cachedAt: now,
          freshUntil: now + freshMs,
          staleUntil: now + staleMs,
          tag,
        });
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, fetchPromise);
    return fetchPromise;
  }

  /**
   * Set cache entry directly (e.g. after a write operation)
   */
  set<T>(key: string, data: T, tag?: string, freshMs?: number) {
    const now = Date.now();
    const fMs = freshMs ?? this.DEFAULT_FRESH_MS;
    this.cache.set(key, {
      data,
      cachedAt: now,
      freshUntil: now + fMs,
      staleUntil: now + this.DEFAULT_STALE_MS,
      tag,
    });
  }

  /**
   * Invalidate by exact key, prefix, or tag
   */
  invalidate(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      this.inFlight.clear();
      return;
    }

    const patternLower = pattern.toLowerCase();
    for (const [key, entry] of this.cache.entries()) {
      if (
        key.toLowerCase().includes(patternLower) ||
        (entry.tag && entry.tag.toLowerCase().includes(patternLower))
      ) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get raw cache statistics for monitoring/diagnostics
   */
  getStats() {
    return {
      entriesCount: this.cache.size,
      inFlightCount: this.inFlight.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global singleton instance
const globalForCache = globalThis as unknown as { cacheManager?: InMemoryCacheManager };
export const cacheManager = globalForCache.cacheManager || new InMemoryCacheManager();
if (process.env.NODE_ENV !== "production") {
  globalForCache.cacheManager = cacheManager;
}
