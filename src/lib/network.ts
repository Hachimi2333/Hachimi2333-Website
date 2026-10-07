import type { NetworkInfo } from '@/types/system'

/**
 * Runtime detection of the CDN serving this page.
 *
 * Deliberately a runtime probe rather than a build-time guess: the provider is a
 * property of whoever answers the request, not of the code that was compiled.
 * Reading `wrangler.jsonc` would only restate what the repository *intends* to
 * deploy to, and would keep claiming "Cloudflare" for a copy served from `npm run
 * preview` or from any host the repository later moves to. One small request
 * answers the question honestly.
 *
 * It has to be a separate request because the page's own response headers are
 * not readable from JavaScript -- `performance.getEntriesByType` exposes timings
 * and sizes but never `server` / `cf-ray` -- so there is no way to learn this
 * from the navigation that already happened.
 */

/** Smallest prerendered-independent asset; already listed in public/_headers. */
const PROBE_URL = '/favicon.ico'

/**
 * Providers recognised by a response header, in the order they are checked.
 *
 * Each entry is deliberately one header: a CDN identifies itself to its own
 * customers, and guessing from `server` alone would call Varnish a CDN. Absent
 * every one of them, the honest answer is that no edge answered.
 */
const CDN_SIGNATURES: ReadonlyArray<{ header: string; name: string }> = [
  { header: 'cf-ray', name: 'Cloudflare' },
  { header: 'x-vercel-id', name: 'Vercel' },
  { header: 'x-nf-request-id', name: 'Netlify' },
  { header: 'x-amz-cf-id', name: 'Amazon CloudFront' },
  { header: 'fly-request-id', name: 'Fly.io' },
]

interface HeaderReader {
  get(name: string): string | null
}

/**
 * Identify the CDN from a set of response headers.
 *
 * Takes a `Headers`-shaped reader rather than `Headers` itself so the lookup
 * stays case-insensitive without depending on which concrete implementation the
 * runtime provides.
 */
function detectCdn(headers: HeaderReader): string | undefined {
  for (const { header, name } of CDN_SIGNATURES) {
    if (headers.get(header)) return name
  }

  const server = headers.get('server')
  if (server?.toLowerCase().includes('vercel')) return 'Vercel'
  if (server?.toLowerCase().includes('cloudflare')) return 'Cloudflare'

  return undefined
}

/**
 * Data-centre code from Cloudflare's `cf-ray`.
 *
 * The header looks like `8b1a2c3d4e5f6789-HKG`: a request id, then the airport
 * code of the colo that terminated the connection. Only the part after the last
 * dash is meaningful, and taking `split('-').pop()` rather than a fixed position
 * keeps working if the id ever changes shape.
 */
function detectEdge(headers: HeaderReader): string | undefined {
  const ray = headers.get('cf-ray')
  if (!ray) return undefined
  return ray.split('-').pop() || undefined
}

export async function probeNetwork(): Promise<NetworkInfo> {
  try {
    // `no-store` so the response is answered by the edge instead of being served
    // from the HTTP cache with no `cf-ray` of its own.
    const response = await fetch(PROBE_URL, { method: 'HEAD', cache: 'no-store' })

    return {
      cdn: detectCdn(response.headers),
      edge: detectEdge(response.headers),
      error: false,
    }
  } catch {
    // Offline, blocked by an extension, or a file:// page: report the failure and
    // let the panel offer a retry rather than inventing a value.
    return { error: true }
  }
}
