/**
 * In-Memory Sliding Window Rate Limiter
 * 
 * NOTE: Suitable for single-instance Node.js processes or development environments.
 * For horizontally scaled multi-instance production clusters, replace the memory store 
 * with a Redis / Upstash shared cache instance.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired rate limit entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function rateLimit({
  identifier,
  limit = 20,
  windowMs = 60 * 1000 // 1 minute window
}: {
  identifier: string;
  limit?: number;
  windowMs?: number;
}) {
  const now = Date.now();
  const record = memoryStore.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs
    };
    memoryStore.set(identifier, newRecord);
    return {
      success: true,
      remaining: limit - 1,
      resetMs: windowMs
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetMs: record.resetTime - now
    };
  }

  record.count += 1;
  memoryStore.set(identifier, record);

  return {
    success: true,
    remaining: limit - record.count,
    resetMs: record.resetTime - now
  };
}
