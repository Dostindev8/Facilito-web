import { headers } from 'next/headers';
import { z } from 'zod';
import { hitMemoryRateLimit, ipKey } from '@/lib/rate-limit';

const MAX_BYTES = 1024;

const metricSchema = z
  .object({
    name: z.enum(['LCP', 'INP', 'CLS', 'FCP', 'TTFB', 'FID']),
    value: z.number().finite().min(0).max(600_000),
    rating: z.enum(['good', 'needs-improvement', 'poor']),
    id: z.string().max(64),
    path: z.string().max(200).regex(/^\/[\w\-/]*$/),
  })
  .strict();

/** Structured log line per metric; read it in the host's logs (Vercel → Logs). Never stores IPs. */
export async function POST(request: Request): Promise<Response> {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BYTES) return new Response(null, { status: 413 });

  const h = await headers();
  const key = ipKey(h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0]);
  // Over the limit: drop silently. A 429 would only add console noise for visitors behind a shared IP.
  if (!hitMemoryRateLimit(`vitals:${key}`, Date.now(), 120, 60_000).ok) return new Response(null, { status: 204 });

  const text = await request.text();
  if (text.length > MAX_BYTES) return new Response(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = metricSchema.safeParse(json);
  if (!parsed.success) return new Response(null, { status: 400 });

  console.info(JSON.stringify({ type: 'web-vital', ...parsed.data }));
  return new Response(null, { status: 204 });
}
