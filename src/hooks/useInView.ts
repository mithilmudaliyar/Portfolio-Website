import { useEffect, useRef, useState } from 'react'

/**
 * Tracks whether an element is (near) the viewport via IntersectionObserver.
 * Used to gate the small standalone WebGL canvases (globe, lab) so they only
 * mount and render while actually visible.
 */
export function useInView<T extends HTMLElement>(rootMargin = '200px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [rootMargin])

  return { ref, inView }
}
