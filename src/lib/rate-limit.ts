/**
 * Fixed-window limiter. Shared across instances through Upstash Redis (REST) when
 * UPSTASH_REDIS_REST_URL/TOKEN are set; otherwise, or if Redis fails, a per-instance Map.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

export type RateResult = { ok: true } | { ok: false; retryAfterSeconds: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000;
const REDIS_TIMEOUT_MS = 1_200;

export const CONTACT_LIMIT = 5;
export const CONTACT_WINDOW_MS = 10 * 60 * 1000;

export function resetRateLimit(): void {
  buckets.clear();
}

/**
 * Normalizes a client IP into a limiter key. IPv6 addresses are grouped by their /64 prefix
 * (same idea as express-rate-limit's ipKeyGenerator) so one host can't rotate addresses.
 */
export function ipKey(raw: string | null | undefined): string {
  const ip = (raw ?? '').trim().replace(/^\[|\]$/g, '').replace(/%.*$/, '');
  if (!ip) return 'unknown';
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped?.[1]) return mapped[1];
  if (!ip.includes(':')) return ip;
  const [head = '', tail = ''] = ip.toLowerCase().split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const fill = ip.includes('::') ? Array(Math.max(0, 8 - left.length - right.length)).fill('0') : [];
  const groups = [...left, ...fill, ...right].map((group) => group.replace(/^0+(?=.)/, '') || '0');
  return `${groups.slice(0, 4).join(':')}::/64`;
}

export function hitMemoryRateLimit(key: string, now = Date.now(), limit = CONTACT_LIMIT, windowMs = CONTACT_WINDOW_MS): RateResult {
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, bucket] of buckets) if (now >= bucket.resetAt) buckets.delete(k);
  }
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (current.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { ok: true };
}

async function redisPipeline(commands: (string | number)[][]): Promise<unknown[] | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(commands),
        signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
        cache: 'no-store',
      });
      if (!response.ok) continue;
      const data = (await response.json()) as { result?: unknown; error?: string }[];
      if (!Array.isArray(data) || data.some((item) => item.error)) continue;
      return data.map((item) => item.result);
    } catch {
      // Timeout or network error: retry once, then fall back to memory.
    }
  }
  return null;
}

export async function hitRateLimit(key: string, limit = CONTACT_LIMIT, windowMs = CONTACT_WINDOW_MS): Promise<RateResult> {
  const redisKey = `facilito-web:rl:${key}`;
  const result = await redisPipeline([
    ['SET', redisKey, 0, 'PX', windowMs, 'NX'],
    ['INCR', redisKey],
    ['PTTL', redisKey],
  ]);
  if (!result) return hitMemoryRateLimit(key, Date.now(), limit, windowMs);
  const count = Number(result[1]);
  const ttl = Number(result[2]);
  if (!Number.isFinite(count)) return hitMemoryRateLimit(key, Date.now(), limit, windowMs);
  if (count > limit) return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((ttl > 0 ? ttl : windowMs) / 1000)) };
  return { ok: true };
}
