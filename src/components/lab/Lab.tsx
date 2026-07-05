import { lazy, Suspense, useEffect, useState } from 'react'
import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './lab.css'

const LabScene = lazy(() => import('./LabScene'))

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

/**
 * Mini interactive strip between Work and Case Studies: one drag-to-inspect
 * 3D instrument. Mounts on approach, renders only while visible; without
 * WebGL a static CSS orbit diagram stands in.
 */
export default function Lab() {
  const reduced = useReducedMotion()
  const { ref, inView } = useInView<HTMLElement>()
  const [mounted, setMounted] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    setHasWebGL(supportsWebGL())
  }, [])

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
          {hasWebGL ? (
            mounted && (
              <Suspense fallback={null}>
                <LabScene active={inView} animate={!reduced} />
              </Suspense>
            )
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
