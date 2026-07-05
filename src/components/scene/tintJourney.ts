import * as THREE from 'three'

/** Camera flythrough geometry — shared by the rig and the nebula washes. */
export const CAMERA_START_Z = 9
export const CAMERA_TRAVEL = 68 // total flythrough distance across the page

/** Camera depth for a 0..1 scroll fraction. */
export function depthAt(t: number): number {
  return CAMERA_START_Z - t * CAMERA_TRAVEL
}

export interface TintStop {
  t: number
  color: THREE.Color
}

/**
 * The scroll journey palette, one stop per section — a single monotonic
 * cool→warm ramp (cyan → blue → violet → magenta → coral → amber) so the
 * warmth eases in gradually instead of appearing only after the Lab.
 * Both the nebula washes and the dust tint read from this one palette.
 */
const JOURNEY: { id: string; color: string }[] = [
  { id: 'hero', color: '#35e0f2' }, // cyan
  { id: 'about', color: '#5a8df2' }, // cool blue
  { id: 'work', color: '#8b6cf2' }, // violet
  { id: 'lab', color: '#c96ccf' }, // magenta — warmth starts easing in
  { id: 'case-studies', color: '#f2836c' }, // coral
  { id: 'contact', color: '#f2a35a' }, // warm amber
]

/** Evenly-spaced stops — used until the real sections can be measured. */
export function fallbackStops(): TintStop[] {
  return JOURNEY.map((stop, i) => ({
    t: i / (JOURNEY.length - 1),
    color: new THREE.Color(stop.color),
  }))
}

/**
 * Measure each section's centre as a fraction of total page scroll so the
 * palette aligns with what is actually on screen (inserting a section can
 * never desync it again). The final amber stop is extended to t=1 so the
 * footer holds warm to the very bottom with no snap back to base.
 */
export function measureStops(): TintStop[] {
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (max <= 0) return fallbackStops()

  const stops: TintStop[] = []
  for (const stop of JOURNEY) {
    const element = document.getElementById(stop.id)
    if (!element) continue
    const rect = element.getBoundingClientRect()
    const centerY = rect.top + window.scrollY + rect.height / 2
    const t = THREE.MathUtils.clamp((centerY - window.innerHeight / 2) / max, 0, 1)
    stops.push({ t, color: new THREE.Color(stop.color) })
  }
  if (stops.length < 2) return fallbackStops()
  stops.sort((a, b) => a.t - b.t)

  // Hold the last tint through the footer to the very bottom.
  const last = stops[stops.length - 1]
  if (last.t < 1) stops.push({ t: 1, color: last.color.clone() })
  return stops
}

/** Piecewise-lerped tint along the stops; clamps (and holds) at both ends. */
export function tintAtStops(stops: TintStop[], t: number, out: THREE.Color): THREE.Color {
  if (t <= stops[0].t) return out.copy(stops[0].color)
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (t <= b.t) {
      const f = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t)
      return out.copy(a.color).lerp(b.color, f)
    }
  }
  return out.copy(stops[stops.length - 1].color)
}
