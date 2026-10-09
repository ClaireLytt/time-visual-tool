const UA = 'TimeVisualPodcast/0.1 (+https://github.com/ClaireLytt/time-visual-tool)'

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

/** Block private, link-local, loopback and metadata IPs to prevent SSRF */
function isPrivateHost(hostname: string): boolean {
  // Reject localhost variants
  if (hostname === 'localhost' || hostname === '[::1]') return true
  // Reject bare IPs in private ranges
  const parts = hostname.split('.')
  if (parts.length === 4 && parts.every(p => /^\d+$/.test(p))) {
    const [a, b] = parts.map(Number)
    if (a === 127) return true                        // 127.0.0.0/8 loopback
    if (a === 10) return true                         // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true  // 172.16.0.0/12
    if (a === 192 && b === 168) return true            // 192.168.0.0/16
    if (a === 169 && b === 254) return true            // 169.254.0.0/16 link-local / cloud metadata
    if (a === 0) return true                           // 0.0.0.0/8
  }
  return false
}

export function assertHttpUrl(raw: unknown): URL {
  if (typeof raw !== 'string' || !raw) throw new HttpError(400, 'missing url')
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new HttpError(400, 'invalid url')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new HttpError(400, 'only http(s) urls are allowed')
  if (isPrivateHost(url.hostname)) throw new HttpError(400, 'private/internal URLs are not allowed')
  return url
}

/**
 * Fetch with timeout and clear error messages.
 * @param timeoutMs — default 15s for API/RSS, pass higher for large audio downloads
 */
export async function fetchOk(url: string | URL, init: RequestInit & { timeoutMs?: number } = {}): Promise<Response> {
  const { timeoutMs = 15_000, ...fetchInit } = init
  const timeout = AbortSignal.timeout(timeoutMs)
  const signal = fetchInit.signal
    ? AbortSignal.any([fetchInit.signal, timeout])
    : timeout

  const host = typeof url === 'string' ? new URL(url).host : url.host
  try {
    const res = await fetch(url, {
      ...fetchInit,
      signal,
      redirect: 'follow',
      headers: { 'user-agent': UA, ...(fetchInit.headers as Record<string, string> | undefined) },
    })
    if (!res.ok) throw new HttpError(502, `Upstream HTTP ${res.status} from ${host}`)
    return res
  } catch (err) {
    const e = err as Error
    if (e.name === 'TimeoutError') {
      throw new HttpError(504, `Network timeout: ${host} did not respond within ${Math.round(timeoutMs / 1000)}s — check VPN/proxy if this host is blocked in your region`)
    }
    if (e.name === 'TypeError' || e.message === 'fetch failed') {
      throw new HttpError(502, `Network error: cannot reach ${host} — the host may be blocked or unreachable, try enabling a VPN/proxy`)
    }
    throw err
  }
}
