import { useCallback, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

const PULL = 0.32
const MAX_SHIFT = 10

/**
 * Magnetic hover: the element eases toward the cursor while hovered and
 * springs back on leave. Returns a callback ref — attach to any element.
 * Inert on touch devices and under prefers-reduced-motion.
 */
export function useMagnetic<T extends HTMLElement>() {
  const reduced = useReducedMotion()
  const cleanup = useRef<(() => void) | null>(null)

  return useCallback(
    (el: T | null) => {
      cleanup.current?.()
      cleanup.current = null
      if (!el || reduced || !window.matchMedia('(pointer: fine)').matches) return

      const onMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        const dx = event.clientX - (rect.left + rect.width / 2)
        const dy = event.clientY - (rect.top + rect.height / 2)
        const x = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, dx * PULL))
        const y = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, dy * PULL))
        el.style.transform = `translate(${x}px, ${y}px)`
      }
      const onLeave = () => {
        el.style.transform = ''
      }

      el.classList.add('is-magnetic')
      el.addEventListener('mousemove', onMove, { passive: true })
      el.addEventListener('mouseleave', onLeave, { passive: true })
      cleanup.current = () => {
        el.classList.remove('is-magnetic')
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
        el.style.transform = ''
      }
    },
    [reduced],
  )
}
