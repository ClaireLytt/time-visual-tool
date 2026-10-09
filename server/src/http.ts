const UA = 'TimeVisualPodcast/0.1 (+https://github.com/ClaireLytt/time-visual-tool)'

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
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
  return url
}

export async function fetchOk(url: string | URL, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    redirect: 'follow',
    headers: { 'user-agent': UA, ...(init.headers as Record<string, string> | undefined) },
  })
  if (!res.ok) throw new HttpError(502, `upstream ${res.status} for ${url}`)
  return res
}
