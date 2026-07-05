import { lazy, Suspense, useEffect, useState } from 'react'
import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const GlobeScene = lazy(() => import('./GlobeScene'))

/**
 * "Based in" instrument for the About section: the 21st.dev D3 dotted
 * globe (canvas2D — no WebGL required) with a pulsing Mumbai marker and a
 * coordinate readout. Mounts only when scrolled near; auto-rotation runs
 * only while visible and is frozen under prefers-reduced-motion (drag
 * still works).
 */
export default function LocationGlobe() {
  const reduced = useReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>()
  const [mounted, setMounted] = useState(false)

  // Mount once on first approach, then keep it (the timer pauses instead).
  useEffect(() => {
    if (inView) setMounted(true)
  }, [inView])

  return (
    <div ref={ref} className="location-globe" data-reveal>
      <div className="location-globe-canvas" aria-hidden="true">
        {mounted && (
          <Suspense fallback={null}>
            <GlobeScene active={inView} animate={!reduced} />
          </Suspense>
        )}
      </div>
      <p className="location-readout">
        <span className="location-coords">19.0760° N / 72.8777° E</span>
        Based in Mumbai, India
      </p>
    </div>
  )
}
