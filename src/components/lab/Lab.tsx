import { lazy, Suspense, useEffect, useState } from 'react'
import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './lab.css'

const LabScene = lazy(() => import('./LabScene'))

/**
 * Mini interactive strip between Work and Case Studies: one drag-to-inspect
 * typographic instrument, drawn with canvas 2D (no WebGL). Mounts on
 * approach, animates only while visible; a static CSS orbit diagram stands
 * in until it mounts.
 */
export default function Lab() {
  const reduced = useReducedMotion()
  const { ref, inView } = useInView<HTMLElement>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (inView) setMounted(true)
  }, [inView])

  return (
    <section ref={ref} id="lab" className="lab" aria-label="Interactive 3D instrument">
      <div className="container lab-inner">
        <div className="lab-copy" data-reveal>
          <p className="kicker">Between observations</p>
          <p className="lab-hint">
            My stack, mapped as a constellation — <em>drag to inspect</em>.
          </p>
        </div>
        <div className="lab-stage" aria-hidden="true">
          {mounted ? (
            <Suspense fallback={null}>
              <LabScene active={inView} animate={!reduced} />
            </Suspense>
          ) : (
            <div className="lab-fallback">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
