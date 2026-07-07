import { lazy, Suspense, useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './scene.css'

const FogScene = lazy(() => import('./FogScene'))

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
 * Persistent flowing-ember-fog background behind the whole page.
 * - Mounts only after the intro is done, so it never blocks first paint.
 * - Pauses (frameloop → demand) when the tab is hidden.
 * - Under prefers-reduced-motion or no WebGL, a static warm-fog CSS layer
 *   stands in — never a blank or a crash.
 */
export default function SceneBackground({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(true)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setHasWebGL(supportsWebGL())
  }, [])

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
          <FogScene active={visible} animate={visible} />
        </Suspense>
      )}
      {/* Scrim keeps foreground text readable over brighter fog */}
      <div className="scene-scrim" />
    </div>
  )
}
