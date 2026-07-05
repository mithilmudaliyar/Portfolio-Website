import { useCallback, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

const MAX_TILT_DEG = 5

/**
 * Cursor-reactive tilt + spotlight. Writes CSS custom properties on the
 * element (--tilt-x/--tilt-y in deg, --spot-x/--spot-y in %) so the CSS
 * layer owns the actual transform and the spotlight gradient position.
 * Returns a callback ref. Inert on touch devices and under
 * prefers-reduced-motion.
 */
export function useTilt<T extends HTMLElement>() {
  const reduced = useReducedMotion()
  const cleanup = useRef<(() => void) | null>(null)

  return useCallback(
    (el: T | null) => {
      cleanup.current?.()
      cleanup.current = null
      if (!el || reduced || !window.matchMedia('(pointer: fine)').matches) return

      let rafId = 0
      const onMove = (event: MouseEvent) => {
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect()
          const px = (event.clientX - rect.left) / rect.width
          const py = (event.clientY - rect.top) / rect.height
          el.style.setProperty('--tilt-x', `${((0.5 - py) * MAX_TILT_DEG * 2).toFixed(2)}deg`)
          el.style.setProperty('--tilt-y', `${((px - 0.5) * MAX_TILT_DEG * 2).toFixed(2)}deg`)
          el.style.setProperty('--spot-x', `${(px * 100).toFixed(1)}%`)
          el.style.setProperty('--spot-y', `${(py * 100).toFixed(1)}%`)
          el.classList.add('is-tilting')
        })
      }
      const onLeave = () => {
        cancelAnimationFrame(rafId)
        el.classList.remove('is-tilting')
        el.style.setProperty('--tilt-x', '0deg')
        el.style.setProperty('--tilt-y', '0deg')
      }

      el.addEventListener('mousemove', onMove, { passive: true })
      el.addEventListener('mouseleave', onLeave, { passive: true })
      cleanup.current = () => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
        cancelAnimationFrame(rafId)
      }
    },
    [reduced],
  )
}
