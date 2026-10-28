export interface Painting {
  id: string
  title: string
  artist: string
  year: string
  imageUrl: string
  /** Position on the wall: percentage from left (legacy, kept for type compat) */
  wallX: number
  /** Position on the wall: percentage from top (legacy) */
  wallY: number
  /** Display width in px */
  width: number
  /** Display height in px */
  height: number
  /** CSS gradient fallback when image can't load */
  fallbackGradient: string
  /** Short story / background about the painting (zh + en) */
  story?: { zh: string; en: string }
  /** Real physical dimensions in cm */
  realSize?: { widthCm: number; heightCm: number }
  /** 5 dominant colors extracted from the painting */
  palette?: string[]
  description?: string
}

export interface GalleryRoom {
  id: string
  name: string
  nameZh: string
  paintings: Painting[]
  /** Wall color */
  wallColor: string
  /** Floor tile colors */
  floorLight: string
  floorDark: string
  /** Ambient sound type */
  ambientSound?: 'bells' | 'piano' | 'organ'
  /** Room-level era label */
  era?: { zh: string; en: string }
  /** Room-level background story */
  roomStory?: { zh: string; en: string }
}
