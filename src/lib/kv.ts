import { createClient } from '@vercel/kv';
import axios from 'axios';

// In-memory fallback for development or when KV is not configured
const memoryCache = new Map<string, { data: any; timestamp: number }>();

// Initialize KV client if env vars exist
const kv = (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  ? createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

interface CacheOptions {
  ttlSeconds: number; // Time for which the data is considered fresh
}

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions
): Promise<T | null> {
  const now = Date.now();
  const { ttlSeconds } = options;

  // 1. Try Cache
  let cached: { data: T; timestamp: number } | null = null;

  try {
    if (kv) {
      cached = await kv.get(key);
    } else {
      cached = memoryCache.get(key) as { data: T; timestamp: number } || null;
    }
  } catch (e) {
    console.warn(`Cache read error for ${key}:`, e);
  }

  // 2. Check Freshness
  if (cached) {
    const ageSeconds = (now - cached.timestamp) / 1000;
    if (ageSeconds < ttlSeconds) {
      // Fresh, return immediately
      return cached.data;
    }
  }

  // 3. Fetch (Stale or Missing)
  try {
    const data = await fetcher();

    // Update Cache
    const entry = { data, timestamp: now };
    try {
      if (kv) {
        await kv.set(key, entry);
      } else {
        memoryCache.set(key, entry);
      }
    } catch (e) {
      console.warn(`Cache write error for ${key}:`, e);
    }

    return data;
  } catch (error) {
    console.error(`Fetch error for ${key}:`, error);

    // 4. Fail-Safe: Return Stale if available
    if (cached) {
      console.warn(`Returning stale data for ${key}`);
      return cached.data;
    }

    // Return null if no cache and fetch failed
    return null;
  }
}

// Helper for generic GET requests
export async function getCached(url: string, ttlSeconds: number) {
    return fetchWithCache(
        url,
        async () => {
            const res = await axios.get(url);
            return res.data;
        },
        { ttlSeconds }
    );
}
