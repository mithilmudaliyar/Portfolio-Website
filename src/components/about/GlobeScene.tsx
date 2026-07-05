import { useEffect, useRef } from 'react'
import { geoBounds, geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import { timer, type Timer } from 'd3-timer'
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson'

/*
 * Adapted from 21st.dev moazamtrade/wireframe-dotted-globe
 * (src/vendor/21st/wireframe-dotted-globe.tsx): D3 orthographic canvas2D
 * globe with real dotted continents. Changes from the vendored original:
 * - land GeoJSON self-hosted in public/ instead of the live GitHub URL
 * - restyled from #000/#fff/#999 defaults to site tokens (translucent
 *   space-charcoal ocean, cyan + dim-white land/dots), sized to container
 * - pulsing cyan Mumbai marker, with a hemisphere check for raw points
 *   (clipAngle only clips path rendering, not projection() calls)
 * - auto-rotation runs only while visible and not reduced-motion; the
 *   vendored press-and-hold drag (mousedown -> document mousemove/mouseup)
 *   is kept and always works, with a touch equivalent added
 * - wheel-zoom dropped so page scroll is never hijacked; console clean;
 *   dpr capped at 1.5; all listeners cleaned up on unmount
 */

const ACCENT = '#35e0f2'
const MARKER_LAT = 19.076 // Mumbai
const MARKER_LON = 72.8777
const AUTO_ROTATE_SPEED = 0.09 // degrees per timer tick
const DRAG_SENSITIVITY = 0.5 // vendored value

type Land = FeatureCollection<Polygon | MultiPolygon>
type LandFeature = Feature<Polygon | MultiPolygon>

interface GlobeSceneProps {
  active: boolean
  animate: boolean
}

export default function GlobeScene({ active, animate }: GlobeSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  const animateRef = useRef(animate)
  const syncRef = useRef<() => void>(() => {})

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let width = 0
    let height = 0
    let radius = 1

    const projection = geoOrthographic().clipAngle(90)
    const path = geoPath(projection, context)
    const graticule = geoGraticule10()

    // Start with Mumbai facing the camera, tilted slightly north.
    const rotation: [number, number] = [-MARKER_LON, -MARKER_LAT + 8]
    projection.rotate(rotation)
    let autoRotate = true
    let pulsePhase = 0

    /* Point-in-polygon + halftone dot generation — vendored verbatim,
       minus the console logging. */
    const pointInPolygon = (point: [number, number], polygon: Position[]): boolean => {
      const [x, y] = point
      let inside = false
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }
      return inside
    }

    const pointInFeature = (point: [number, number], feature: LandFeature): boolean => {
      const geometry = feature.geometry
      if (geometry.type === 'Polygon') {
        const coordinates = geometry.coordinates
        if (!pointInPolygon(point, coordinates[0])) return false
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) return false // in a hole
        }
        return true
      }
      for (const polygon of geometry.coordinates) {
        if (pointInPolygon(point, polygon[0])) {
          let inHole = false
          for (let i = 1; i < polygon.length; i++) {
            if (pointInPolygon(point, polygon[i])) {
              inHole = true
              break
            }
          }
          if (!inHole) return true
        }
      }
      return false
    }

    const generateDotsInPolygon = (feature: LandFeature, dotSpacing = 16): [number, number][] => {
      const dots: [number, number][] = []
      const [[minLng, minLat], [maxLng, maxLat]] = geoBounds(feature)
      const stepSize = dotSpacing * 0.08
      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat]
          if (pointInFeature(point, feature)) dots.push(point)
        }
      }
      return dots
    }

    const allDots: { lng: number; lat: number }[] = []
    let landFeatures: Land | null = null

    const render = () => {
      context.clearRect(0, 0, width, height)
      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // Ocean — translucent space charcoal so the page shows through
      context.beginPath()
      context.arc(width / 2, height / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = 'rgba(12, 14, 18, 0.55)'
      context.fill()
      context.strokeStyle = 'rgba(53, 224, 242, 0.3)'
      context.lineWidth = 1.25 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // Graticule — very faint dim-white
        context.beginPath()
        path(graticule)
        context.strokeStyle = '#ededef'
        context.lineWidth = 1 * scaleFactor
        context.globalAlpha = 0.07
        context.stroke()
        context.globalAlpha = 1

        // Land outlines — dim white
        context.beginPath()
        for (const feature of landFeatures.features) path(feature)
        context.strokeStyle = 'rgba(237, 237, 239, 0.38)'
        context.lineWidth = 1 * scaleFactor
        context.stroke()

        // Visible-hemisphere centre for raw point projections
        const center: [number, number] = [-rotation[0], -rotation[1]]

        // Halftone dots — cyan
        context.fillStyle = 'rgba(53, 224, 242, 0.5)'
        for (const dot of allDots) {
          if (geoDistance([dot.lng, dot.lat], center) > Math.PI / 2) continue
          const projected = projection([dot.lng, dot.lat])
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= width &&
            projected[1] >= 0 &&
            projected[1] <= height
          ) {
            context.beginPath()
            context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI)
            context.fill()
          }
        }

        // Mumbai marker — pulsing cyan dot + halo
        if (geoDistance([MARKER_LON, MARKER_LAT], center) < Math.PI / 2) {
          const projected = projection([MARKER_LON, MARKER_LAT])
          if (projected) {
            const pulse = animateRef.current ? 1 + 0.3 * Math.sin(pulsePhase) : 1
            context.beginPath()
            context.arc(projected[0], projected[1], 9 * scaleFactor * pulse, 0, 2 * Math.PI)
            context.fillStyle = 'rgba(53, 224, 242, 0.16)'
            context.fill()
            context.beginPath()
            context.arc(projected[0], projected[1], 3.2 * scaleFactor, 0, 2 * Math.PI)
            context.fillStyle = ACCENT
            context.fill()
          }
        }
      }
    }

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      width = rect.width
      height = rect.height
      radius = Math.min(width, height) / 2.3
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      projection.scale(radius).translate([width / 2, height / 2])
      render()
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(wrap)

    // Self-hosted Natural Earth land — never fetched from the live GitHub URL.
    const abort = new AbortController()
    fetch(`${import.meta.env.BASE_URL}ne_110m_land.json`, { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error('land data unavailable')
        return response.json() as Promise<Land>
      })
      .then((data) => {
        landFeatures = data
        for (const feature of data.features) {
          for (const [lng, lat] of generateDotsInPolygon(feature, 16)) {
            allDots.push({ lng, lat })
          }
        }
        render()
      })
      .catch(() => {
        /* aborted or offline — the coordinate readout stands alone */
      })

    // Auto-rotation on a d3 timer — started/stopped so nothing ticks while
    // the section is offscreen or under prefers-reduced-motion.
    let rotationTimer: Timer | null = null
    const startTimer = () => {
      if (rotationTimer) return
      rotationTimer = timer((elapsed) => {
        pulsePhase = elapsed * 0.0035
        if (autoRotate) {
          rotation[0] += AUTO_ROTATE_SPEED
          projection.rotate(rotation)
        }
        render()
      })
    }
    const stopTimer = () => {
      rotationTimer?.stop()
      rotationTimer = null
    }
    syncRef.current = () => {
      if (activeRef.current && animateRef.current) startTimer()
      else {
        stopTimer()
        render() // one still frame so the globe is never blank
      }
    }
    syncRef.current()

    /* Vendored press-and-hold drag: mousedown on the canvas, then
       mousemove/mouseup on the DOCUMENT — leaving the canvas mid-drag
       keeps rotating until release. */
    let activeMove: ((e: MouseEvent) => void) | null = null
    let activeUp: (() => void) | null = null

    const beginDrag = (startX: number, startY: number) => {
      autoRotate = false
      const startRotation: [number, number] = [rotation[0], rotation[1]]
      return (clientX: number, clientY: number) => {
        rotation[0] = startRotation[0] + (clientX - startX) * DRAG_SENSITIVITY
        rotation[1] = Math.max(
          -90,
          Math.min(90, startRotation[1] - (clientY - startY) * DRAG_SENSITIVITY),
        )
        projection.rotate(rotation)
        render()
      }
    }

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault()
      const applyDrag = beginDrag(event.clientX, event.clientY)
      const handleMouseMove = (moveEvent: MouseEvent) => {
        applyDrag(moveEvent.clientX, moveEvent.clientY)
      }
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        activeMove = null
        activeUp = null
        setTimeout(() => {
          autoRotate = true
        }, 10)
      }
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      activeMove = handleMouseMove
      activeUp = handleMouseUp
    }

    // Same press-and-hold pattern for touch.
    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      const applyDrag = beginDrag(touch.clientX, touch.clientY)
      const handleTouchMove = (moveEvent: TouchEvent) => {
        const t = moveEvent.touches[0]
        if (t) applyDrag(t.clientX, t.clientY)
      }
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
        setTimeout(() => {
          autoRotate = true
        }, 10)
      }
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })

    return () => {
      stopTimer()
      abort.abort()
      resizeObserver.disconnect()
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('touchstart', handleTouchStart)
      if (activeMove) document.removeEventListener('mousemove', activeMove)
      if (activeUp) document.removeEventListener('mouseup', activeUp)
    }
  }, [])

  // Visibility / reduced-motion changes just start or stop the timer.
  useEffect(() => {
    activeRef.current = active
    animateRef.current = animate
    syncRef.current()
  }, [active, animate])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', touchAction: 'none' }} />
    </div>
  )
}
