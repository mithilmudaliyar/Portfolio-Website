import { useEffect, useRef } from 'react'

/**
 * The lab instrument, redrawn for the paper-and-ink skin: the stack
 * mapped as a typographic constellation. Each technology name sits on a
 * slowly turning 3D-projected sphere, rendered with plain canvas 2D —
 * ink type, hairline ticks, a clay core. Drag to throw it with inertia.
 * No WebGL, dpr capped at 1.5, draws only while `active`.
 */
const STACK = [
  'Python',
  'ML',
  'CV',
  'NLP',
  'React',
  'TypeScript',
  'Node',
  'SQL',
  'Java',
  'Git',
]

const INK = '240, 228, 214' // warm smoke — matches --text on the ember theme
const CLAY = '#e26a38' // --accent ember
const RADIUS_JITTER = [1, 1.14, 1.06, 1.2, 1.02, 1.16, 1.08, 1.1, 1.04, 1.18]
const IDLE_SPEED = 0.0032 // radians per frame at 60fps
const DRAG_DAMPING = 0.94

interface LabSceneProps {
  active: boolean
  animate: boolean
}

export default function LabScene({ active, animate }: LabSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  const animateRef = useRef(animate)

  useEffect(() => {
    activeRef.current = active
    animateRef.current = animate
  }, [active, animate])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let width = 0
    let height = 0

    // Fibonacci-distributed unit sphere with a little radius jitter, so
    // the constellation reads organic rather than geodesic.
    const golden = Math.PI * (3 - Math.sqrt(5))
    const points = STACK.map((label, i) => {
      const y = 1 - (i / (STACK.length - 1)) * 2
      const ring = Math.sqrt(1 - y * y)
      const theta = golden * i
      const r = RADIUS_JITTER[i]
      return { label, x: Math.cos(theta) * ring * r, y: y * r, z: Math.sin(theta) * ring * r }
    })

    let rotY = 0.6
    let rotX = 0.25
    const drag = { active: false, vx: 0, vy: 0, lastX: 0, lastY: 0 }

    const render = () => {
      context.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2
      const scale = Math.min(width, height) * 0.36
      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)
      const cosX = Math.cos(rotX)
      const sinX = Math.sin(rotX)

      // Clay core — the portfolio itself
      context.beginPath()
      context.arc(cx, cy, 4, 0, Math.PI * 2)
      context.fillStyle = CLAY
      context.fill()
      context.beginPath()
      context.arc(cx, cy, 9, 0, Math.PI * 2)
      context.strokeStyle = `rgba(226, 106, 56, 0.4)`
      context.lineWidth = 1
      context.stroke()

      const projected = points
        .map((p) => {
          // rotate around Y, then X
          const x1 = p.x * cosY + p.z * sinY
          const z1 = -p.x * sinY + p.z * cosY
          const y1 = p.y * cosX - z1 * sinX
          const z2 = p.y * sinX + z1 * cosX
          const depth = (z2 + 1.4) / 2.4 // 0 (far) → 1 (near)
          return { label: p.label, sx: cx + x1 * scale, sy: cy + y1 * scale, depth }
        })
        .sort((a, b) => a.depth - b.depth)

      for (const p of projected) {
        const alpha = 0.25 + p.depth * 0.75

        // Hairline from the core — fades with depth
        context.beginPath()
        context.moveTo(cx, cy)
        context.lineTo(p.sx, p.sy)
        context.strokeStyle = `rgba(${INK}, ${0.06 + p.depth * 0.12})`
        context.lineWidth = 1
        context.stroke()

        // Tick + label
        context.beginPath()
        context.arc(p.sx, p.sy, 1.5 + p.depth * 1.5, 0, Math.PI * 2)
        context.fillStyle = `rgba(${INK}, ${alpha})`
        context.fill()

        const size = 11 + p.depth * 5
        context.font = `500 ${size}px 'Instrument Sans', system-ui, sans-serif`
        context.fillStyle = `rgba(${INK}, ${alpha})`
        context.fillText(p.label, p.sx + 7, p.sy + 4)
      }
    }

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      render()
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(wrap)

    let rafId = 0
    const tick = () => {
      rafId = requestAnimationFrame(tick)
      if (!activeRef.current) return
      rotY += drag.vx
      rotX += drag.vy
      drag.vx *= DRAG_DAMPING
      drag.vy *= DRAG_DAMPING
      if (animateRef.current && !drag.active) rotY += IDLE_SPEED
      rotX = Math.max(-1.2, Math.min(1.2, rotX))
      render()
    }
    rafId = requestAnimationFrame(tick)

    // Press-and-hold drag: down on the canvas, move/up on the document,
    // so leaving the stage mid-drag keeps rotating until release.
    const onPointerDown = (event: PointerEvent) => {
      drag.active = true
      drag.lastX = event.clientX
      drag.lastY = event.clientY
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active) return
      drag.vx = (event.clientX - drag.lastX) * 0.005
      drag.vy = (event.clientY - drag.lastY) * 0.004
      drag.lastX = event.clientX
      drag.lastY = event.clientY
    }
    const onPointerUp = () => {
      drag.active = false
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerUp)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', touchAction: 'none' }} />
    </div>
  )
}
