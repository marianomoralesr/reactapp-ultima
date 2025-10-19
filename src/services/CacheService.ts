/**
 * CacheService - Robust multi-layer caching with IndexedDB
 *
 * Caching Strategy:
 * 1. In-memory cache (fastest, session-only, 5 min TTL)
 * 2. IndexedDB cache (persistent, 1 hour TTL)
 * 3. Remote API (fallback when cache misses)
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

class CacheService {
  private static readonly DB_NAME = 'TrefaVehiclesDB';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'vehiclesCache';
  private static readonly CACHE_VERSION = 'v2.0'; // Bumped to invalidate old cache with missing images

  // TTL configurations
  private static readonly INDEXEDDB_TTL = 60 * 60 * 1000; // 1 hour
  private static readonly MEMORY_TTL = 5 * 60 * 1000; // 5 minutes

  // In-memory cache
  private static memoryCache = new Map<string, CacheEntry<any>>();

  /**
   * Initialize IndexedDB
   */
  private static async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Get data from cache (checks memory → IndexedDB → returns null)
   */
  public static async get<T>(key: string): Promise<T | null> {
    const now = Date.now();

    // Level 1: Check in-memory cache
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && (now - memoryEntry.timestamp < this.MEMORY_TTL)) {
      console.log(`[CacheService] Cache HIT (memory): ${key}`);
      return memoryEntry.data as T;
    }

    // Level 2: Check IndexedDB cache
    try {
      const db = await this.initDB();
      const transaction = db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);

      const request = store.get(key);
      const result: any = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      db.close();

      if (result && result.entry) {
        const entry = result.entry as CacheEntry<T>;

        // Check if cache is still valid
        if (now - entry.timestamp < this.INDEXEDDB_TTL && entry.version === this.CACHE_VERSION) {
          console.log(`[CacheService] Cache HIT (IndexedDB): ${key}`);

          // Populate memory cache for faster subsequent access
          this.memoryCache.set(key, entry);

          return entry.data;
        } else {
          console.log(`[CacheService] Cache EXPIRED (IndexedDB): ${key}`);
          // Clean up expired entry
          await this.delete(key);
        }
      }
    } catch (error) {
      console.warn(`[CacheService] IndexedDB read error for ${key}:`, error);
    }

    console.log(`[CacheService] Cache MISS: ${key}`);
    return null;
  }

  /**
   * Set data in cache (stores in both memory and IndexedDB)
   */
  public static async set<T>(key: string, data: T): Promise<void> {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      version: this.CACHE_VERSION,
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);
    console.log(`[CacheService] Stored in memory: ${key}`);

    // Store in IndexedDB
    try {
      const db = await this.initDB();
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.put({ key, entry });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
      console.log(`[CacheService] Stored in IndexedDB: ${key}`);
    } catch (error) {
      console.warn(`[CacheService] IndexedDB write error for ${key}:`, error);
    }
  }

  /**
   * Delete data from cache
   */
  public static async delete(key: string): Promise<void> {
    // Remove from memory cache
    this.memoryCache.delete(key);

    // Remove from IndexedDB
    try {
      const db = await this.initDB();
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
      console.log(`[CacheService] Deleted from cache: ${key}`);
    } catch (error) {
      console.warn(`[CacheService] IndexedDB delete error for ${key}:`, error);
    }
  }

  /**
   * Clear all cache data
   */
  public static async clearAll(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear IndexedDB
    try {
      const db = await this.initDB();
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
      console.log(`[CacheService] All cache cleared`);
    } catch (error) {
      console.warn(`[CacheService] IndexedDB clear error:`, error);
    }
  }

  /**
   * Get cache statistics
   */
  public static async getStats(): Promise<{ memoryKeys: number; indexedDBKeys: number }> {
    const memoryKeys = this.memoryCache.size;

    let indexedDBKeys = 0;
    try {
      const db = await this.initDB();
      const transaction = db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);

      const request = store.count();
      indexedDBKeys = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      db.close();
    } catch (error) {
      console.warn('[CacheService] Error getting IndexedDB stats:', error);
    }

    return { memoryKeys, indexedDBKeys };
  }
}

export default CacheService;
