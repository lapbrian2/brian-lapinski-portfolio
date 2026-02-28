/** Minimal Lenis smooth-scroll interface used by composables. */
export interface LenisInstance {
  stop: () => void
  start: () => void
  on: (event: string, cb: (e: { velocity: number }) => void) => void
  off: (event: string, cb: (e: { velocity: number }) => void) => void
}
