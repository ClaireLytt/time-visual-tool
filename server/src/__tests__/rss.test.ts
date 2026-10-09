import { describe, expect, it } from 'vitest'
import { parseDuration, parseFeed } from '../rss.js'

const FEED = `<?xml version="1.0"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:podcast="https://podcastindex.org/namespace/1.0">
<channel>
  <title>Test Show</title>
  <itunes:author>Host</itunes:author>
  <itunes:image href="https://example.com/art.jpg"/>
  <item>
    <title>Ep 2</title>
    <guid isPermaLink="false">ep-2</guid>
    <pubDate>Fri, 09 Oct 2026 10:00:00 GMT</pubDate>
    <itunes:duration>1:02:03</itunes:duration>
    <enclosure url="https://example.com/2.mp3" type="audio/mpeg" length="1"/>
    <podcast:transcript url="https://example.com/2.json" type="application/json"/>
    <podcast:transcript url="https://example.com/2.vtt" type="text/vtt"/>
    <podcast:transcript url="https://example.com/2.html" type="text/html"/>
  </item>
  <item>
    <title>Ep 1</title>
    <itunes:duration>754</itunes:duration>
    <enclosure url="https://example.com/1.mp3" type="audio/mpeg" length="1"/>
  </item>
  <item><title>No audio</title></item>
</channel>
</rss>`

describe('parseDuration', () => {
  it('handles h:m:s, m:s and seconds', () => {
    expect(parseDuration('1:02:03')).toBe(3723)
    expect(parseDuration('62:03')).toBe(3723)
    expect(parseDuration('3723')).toBe(3723)
    expect(parseDuration('')).toBeNull()
    expect(parseDuration('abc')).toBeNull()
  })
})

describe('parseFeed', () => {
  const feed = parseFeed(FEED)

  it('reads channel info', () => {
    expect(feed.title).toBe('Test Show')
    expect(feed.author).toBe('Host')
    expect(feed.artwork).toBe('https://example.com/art.jpg')
  })

  it('keeps only items with an enclosure', () => {
    expect(feed.episodes.map(e => e.title)).toEqual(['Ep 2', 'Ep 1'])
  })

  it('extracts episode fields', () => {
    const [ep2, ep1] = feed.episodes
    expect(ep2).toMatchObject({
      id: 'ep-2',
      duration: 3723,
      audioUrl: 'https://example.com/2.mp3',
      pubDate: '2026-10-09T10:00:00.000Z',
    })
    expect(ep1.id).toMatch(/^[0-9a-f]{40}$/) // sha1 fallback
    expect(ep1.duration).toBe(754)
    expect(ep1.transcript).toBeUndefined()
  })

  it('prefers vtt over json and ignores html transcripts', () => {
    expect(feed.episodes[0].transcript).toEqual({ url: 'https://example.com/2.vtt', type: 'vtt' })
  })

  it('rejects non-RSS', () => {
    expect(() => parseFeed('<html></html>')).toThrow()
  })
})
