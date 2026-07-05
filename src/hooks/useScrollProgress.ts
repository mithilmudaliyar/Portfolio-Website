import { useCallback, useEffect, useRef } from 'react'

/**
 * Page-wide scroll fraction (0..1), updated on a rAF-throttled scroll
 * listener. Returned as a getter so consumers (the 3D camera, the progress
 * bar) can read it every frame without re-rendering React.
 */
export function useScrollProgress(): () => number {
  const progressRef = useRef(0)

  useEffect(() => {
    let rafId = 0
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progressRef.current = max > 0 ? Math.min(1, window.scrollY / max) : 0
    }
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return useCallback(() => progressRef.current, [])
}
