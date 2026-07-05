import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Desktop-only cursor: a crisp dot that tracks the pointer 1:1 and a ring
 * that trails it with a lerp. Interactive elements grow the ring. Disabled
 * on touch devices and under prefers-reduced-motion.
 */
export default function CustomCursor() {
  const reduced = useReducedMotion()
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.body.classList.add('has-custom-cursor')

    let targetX = -100
    let targetY = -100
    let ringX = -100
    let ringY = -100
    let rafId = 0

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      dot.style.transform = `translate(${targetX - 3}px, ${targetY - 3}px)`
    }

    const onOver = (event: MouseEvent) => {
      const interactive = (event.target as HTMLElement).closest('a, button, [data-cursor]')
      ring.classList.toggle('is-active', Boolean(interactive))
    }

    const tick = () => {
      ringX += (targetX - ringX) * 0.16
      ringY += (targetY - ringY) * 0.16
      const size = ring.offsetWidth / 2
      ring.style.transform = `translate(${ringX - size}px, ${ringY - size}px)`
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    rafId = requestAnimationFrame(tick)

    return () => {
      document.body.classList.remove('has-custom-cursor')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(rafId)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
