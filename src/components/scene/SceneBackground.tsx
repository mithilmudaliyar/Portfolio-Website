import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './scene.css'

const Scene3D = lazy(() => import('./Scene3D'))

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
 * Persistent morphing wireframe object behind the whole page — the
 * "3D + Editorial Kinetic" signature element.
 * - Mounts only after the intro is done, so it never blocks first paint.
 * - Pauses rendering when the tab is hidden.
 * - Under prefers-reduced-motion or no WebGL, a static CSS gradient layer
 *   stands in — never a blank or a crash.
 */
export default function SceneBackground({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(true)
  const [visible, setVisible] = useState(true)
  const inkShadowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHasWebGL(supportsWebGL())
  }, [])

  // Ink shadow fades once you scroll past the hero — direct style writes
  // avoid a React re-render on every scroll tick.
  useEffect(() => {
    if (reduced) return
    const onScroll = () => {
      const el = inkShadowRef.current
      if (!el) return
      el.style.opacity = String(Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.7)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [reduced])

  useEffect(() => {
    if (ready) setMounted(true)
  }, [ready])

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const useCanvas = mounted && hasWebGL && !reduced

  return (
    <div className="scene-layer" aria-hidden="true">
      {/* Static warm-fog fallback: always painted, sits under the canvas so
          there is never a flash of empty ground before/without WebGL. */}
      <div className="scene-fallback" />
      {useCanvas && (
        <Suspense fallback={null}>
          <Scene3D active={visible} />
        </Suspense>
      )}
      <div ref={inkShadowRef} className="scene-ink-shadow" />
      {/* Scrim keeps foreground text readable over the object */}
      <div className="scene-scrim" />
    </div>
  )
}
