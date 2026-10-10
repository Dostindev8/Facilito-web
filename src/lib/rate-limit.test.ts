import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONTACT_LIMIT, hitMemoryRateLimit, hitRateLimit, ipKey, resetRateLimit } from './rate-limit';

describe('hitMemoryRateLimit', () => {
  afterEach(() => resetRateLimit());

  it('permite el cupo y bloquea el siguiente', () => {
    for (let i = 0; i < CONTACT_LIMIT; i += 1) expect(hitMemoryRateLimit('ip', 1_000).ok).toBe(true);
    const blocked = hitMemoryRateLimit('ip', 1_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('no mezcla claves', () => {
    for (let i = 0; i < CONTACT_LIMIT; i += 1) hitMemoryRateLimit('a', 1_000);
    expect(hitMemoryRateLimit('b', 1_000).ok).toBe(true);
  });

  it('reabre la ventana al expirar', () => {
    for (let i = 0; i <= CONTACT_LIMIT; i += 1) hitMemoryRateLimit('w', 1_000);
    expect(hitMemoryRateLimit('w', 1_000 + 10 * 60 * 1000).ok).toBe(true);
  });
});

describe('hitRateLimit', () => {
  afterEach(() => {
    resetRateLimit();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('usa memoria sin Upstash configurado', async () => {
    for (let i = 0; i < CONTACT_LIMIT; i += 1) expect((await hitRateLimit('m')).ok).toBe(true);
    expect((await hitRateLimit('m')).ok).toBe(false);
  });

  it('usa el contador de Redis cuando responde', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 't');
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([{ result: null }, { result: CONTACT_LIMIT + 1 }, { result: 30_000 }])));
    vi.stubGlobal('fetch', fetchMock);
    const result = await hitRateLimit('r');
    expect(result).toEqual({ ok: false, retryAfterSeconds: 30 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('cae a memoria si Redis falla dos veces', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 't');
    const fetchMock = vi.fn(async () => {
      throw new Error('network');
    });
    vi.stubGlobal('fetch', fetchMock);
    expect((await hitRateLimit('f')).ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('ipKey', () => {
  it('deja IPv4 igual y desenvuelve IPv4 mapeada', () => {
    expect(ipKey('203.0.113.9')).toBe('203.0.113.9');
    expect(ipKey('::ffff:203.0.113.9')).toBe('203.0.113.9');
  });

  it('agrupa IPv6 por /64', () => {
    expect(ipKey('2001:db8:abcd:12:1:2:3:4')).toBe('2001:db8:abcd:12::/64');
    expect(ipKey('2001:db8:abcd:12::99')).toBe('2001:db8:abcd:12::/64');
    expect(ipKey('2001:0db8::1')).toBe('2001:db8:0:0::/64');
  });

  it('vacío no rompe', () => {
    expect(ipKey('')).toBe('unknown');
    expect(ipKey(null)).toBe('unknown');
  });
});
