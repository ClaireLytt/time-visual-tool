export interface Painting {
  id: string
  title: string
  artist: string
  year: string
  imageUrl: string
  /** Position on the wall: percentage from left */
  wallX: number
  /** Position on the wall: percentage from top */
  wallY: number
  /** Display width in px */
  width: number
  /** Display height in px */
  height: number
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
}
