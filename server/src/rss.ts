import { createHash } from 'node:crypto'
import { XMLParser } from 'fast-xml-parser'
import type { Episode, Feed, TranscriptType } from './types.js'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  isArray: name => name === 'item' || name === 'podcast:transcript',
})

/** "1:02:03" | "62:03" | "3723" → seconds */
export function parseDuration(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === '') return null
  const s = String(raw).trim()
  if (/^\d+(\.\d+)?$/.test(s)) return Math.round(Number(s))
  const parts = s.split(':').map(Number)
  if (parts.length > 3 || parts.some(n => Number.isNaN(n))) return null
  return parts.reduce((acc, n) => acc * 60 + n, 0)
}

function text(node: unknown): string {
  if (node === undefined || node === null) return ''
  if (typeof node === 'object') return String((node as Record<string, unknown>)['#text'] ?? '')
  return String(node)
}

const TYPE_RANK: Record<TranscriptType, number> = { srt: 0, vtt: 1, json: 2 }

export function transcriptTypeOf(mime: string, url: string): TranscriptType | null {
  const m = mime.toLowerCase()
  if (m.includes('srt') || m.includes('subrip')) return 'srt'
  if (m.includes('vtt')) return 'vtt'
  if (m.includes('json')) return 'json'
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase()
  if (ext === 'srt' || ext === 'vtt' || ext === 'json') return ext
  return null
}

function pickTranscript(nodes: unknown): Episode['transcript'] {
  if (!Array.isArray(nodes)) return undefined
  let best: Episode['transcript']
  for (const n of nodes as Record<string, string>[]) {
    const url = n['@_url']
    if (!url) continue
    const type = transcriptTypeOf(n['@_type'] ?? '', url)
    if (!type) continue
    if (!best || TYPE_RANK[type] < TYPE_RANK[best.type]) best = { url, type }
  }
  return best
}

function toIso(raw: string): string | null {
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function parseFeed(xml: string): Feed {
  const doc = parser.parse(xml)
  const channel = doc?.rss?.channel
  if (!channel) throw new Error('not an RSS feed')

  const episodes: Episode[] = []
  for (const item of (channel.item ?? []) as Record<string, any>[]) {
    const audioUrl = item.enclosure?.['@_url']
    if (!audioUrl) continue
    const guid = text(item.guid)
    episodes.push({
      id: guid || createHash('sha1').update(audioUrl).digest('hex'),
      title: text(item.title) || '(untitled)',
      pubDate: item.pubDate ? toIso(text(item.pubDate)) : null,
      duration: parseDuration(text(item['itunes:duration'])),
      audioUrl,
      transcript: pickTranscript(item['podcast:transcript']),
    })
  }

  return {
    title: text(channel.title),
    author: text(channel['itunes:author']),
    artwork: channel['itunes:image']?.['@_href'] ?? channel.image?.url ?? null,
    episodes,
  }
}
