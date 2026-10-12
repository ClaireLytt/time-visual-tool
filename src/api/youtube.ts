import type { Segment } from '../types/podcast'

const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api'

export interface YouTubeVideoInfo {
  videoId: string
  title: string
  channelName: string
  thumbnailUrl: string
}

/** Extract a YouTube video ID from various URL formats */
export function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    const hosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com']
    if (!hosts.includes(u.hostname)) return null
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null
    if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null
    return u.searchParams.get('v')
  } catch {
    return null
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function fetchYouTubeInfo(url: string, signal?: AbortSignal): Promise<YouTubeVideoInfo> {
  return getJson<YouTubeVideoInfo>(`${API_BASE}/youtube/info?url=${encodeURIComponent(url)}`, signal)
}

export async function fetchYouTubeTranscript(
  videoId: string,
  lang = 'en',
  signal?: AbortSignal,
): Promise<Segment[]> {
  const data = await getJson<{ segments: Segment[] }>(
    `${API_BASE}/youtube/transcript?videoId=${encodeURIComponent(videoId)}&lang=${encodeURIComponent(lang)}`,
    signal,
  )
  return data.segments
}
