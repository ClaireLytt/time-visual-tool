export type Segment = { start: number; end: number; text: string } // seconds
export type Transcript = { episodeId: string; language: string; segments: Segment[] }

export type TranscriptType = 'srt' | 'vtt' | 'json'

export interface PodcastSummary {
  collectionId: number
  collectionName: string
  artistName: string
  artworkUrl600: string
  feedUrl?: string
}

export interface Episode {
  id: string
  title: string
  pubDate: string | null
  duration: number | null // seconds
  audioUrl: string
  transcript?: { url: string; type: TranscriptType }
}

export interface Feed {
  title: string
  author: string
  artwork: string | null
  episodes: Episode[]
}
