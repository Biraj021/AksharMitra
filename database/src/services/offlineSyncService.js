/**
 * src/services/offlineSyncService.js
 * Offline-first resilience layer for AksharMitra.
 * Manages pending synchronization queues when network is disconnected
 * and transparently flushes them when online.
 */

const QUEUE_KEY = 'aksharmitra_pending_sync_v1';
const CACHE_PREFIX = 'aksharmitra_cache_';

export function getPendingQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePendingQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('[OfflineSync] Failed to save queue:', e);
  }
}

/**
 * Enqueue a pending mutation when offline or database is unreachable
 */
export function enqueueOfflineMutation(type, payload) {
  const queue = getPendingQueue();
  queue.push({
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: new Date().toISOString()
  });
  savePendingQueue(queue);
}

/**
 * Cache an entity locally for fast offline access
 */
export function setLocalCache(key, data) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('[OfflineSync] Cache write error:', e);
  }
}

export function getLocalCache(key) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Flushes all pending mutations to Supabase when network is restored.
 */
export async function flushOfflineQueue(handlers = {}) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { flushed: 0, remaining: getPendingQueue().length };
  }

  const queue = getPendingQueue();
  if (!queue.length) return { flushed: 0, remaining: 0 };

  const remaining = [];
  let flushedCount = 0;

  for (const item of queue) {
    try {
      const handler = handlers[item.type];
      if (typeof handler === 'function') {
        await handler(item.payload);
        flushedCount++;
      } else {
        // Unknown handler; keep it
        remaining.push(item);
      }
    } catch (err) {
      console.warn(`[OfflineSync] Error syncing item ${item.id} (${item.type}):`, err);
      remaining.push(item);
    }
  }

  savePendingQueue(remaining);
  return { flushed: flushedCount, remaining: remaining.length };
}

// Auto-register network reconnection listener in browser environments
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // Dispatch custom event that services or context can listen to
    window.dispatchEvent(new CustomEvent('aksharmitra:online_sync'));
  });
}
