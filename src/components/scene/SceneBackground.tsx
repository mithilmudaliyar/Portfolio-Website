import { lazy, Suspense, useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import './scene.css'

const SceneCanvas = lazy(() => import('./SceneCanvas'))

const MOBILE_QUERY = '(max-width: 768px)'
const PARTICLES_DESKTOP = 2400
const PARTICLES_MOBILE = 900

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
 * The single persistent 3D background behind the whole page.
 * Loading strategy is unchanged from the hero-only version: text renders
 * first, WebGL mounts after the browser goes idle, the loop pauses when the
 * tab is hidden, and a pure-CSS starfield covers no-WebGL / reduced-motion.
 */
export default function SceneBackground({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion()
  const [mount3D, setMount3D] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const getScroll = useScrollProgress()

  // Defer WebGL init until the main thread is idle — protects LCP/INP.
  useEffect(() => {
    if (reduced || !supportsWebGL()) return
    const start = () => setMount3D(true)
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(start, { timeout: 1500 })
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(start, 600)
    return () => clearTimeout(id)
  }, [reduced])

  // The canvas is fixed (always on screen) — pause on tab visibility only.
  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  return (
    <div className="scene-layer" aria-hidden="true">
      {mount3D ? (
        <Suspense fallback={<div className="scene-fallback" />}>
          <SceneCanvas
            active={ready && tabVisible}
            particleBudget={isMobile ? PARTICLES_MOBILE : PARTICLES_DESKTOP}
            isMobile={isMobile}
            getScroll={getScroll}
          />
        </Suspense>
      ) : (
        <div className="scene-fallback" />
      )}
    </div>
  )
}
