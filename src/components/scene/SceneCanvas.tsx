import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Dust from './Dust'
import SectionAccents from './SectionAccents'
import Atmosphere from './Atmosphere'
import Constellation from '../hero/Constellation'
import {
  CAMERA_START_Z,
  CAMERA_TRAVEL,
  fallbackStops,
  measureStops,
  tintAtStops,
  type TintStop,
} from './tintJourney'

interface SceneCanvasProps {
  active: boolean
  particleBudget: number
  isMobile: boolean
  getScroll: () => number
}

interface RigProps {
  particleBudget: number
  isMobile: boolean
  getScroll: () => number
}

/**
 * The full-page flythrough. One camera travels along -z as the page
 * scrolls; the cursor drives a smoothed, critically-damped pointer target
 * that translates (not just rotates) every layer with a per-depth factor —
 * so parallax is visible everywhere, including dead centre.
 */
function Rig({ particleBudget, isMobile, getScroll }: RigProps) {
  const smooth = useRef({ x: 0, y: 0 })
  const nearLayer = useRef<THREE.Group>(null)
  const farLayer = useRef<THREE.Group>(null)
  const gl = useThree((state) => state.gl)
  const pixelRatio = useMemo(() => Math.min(gl.getPixelRatio(), 1.5), [gl])

  const getPointer = useRef(() => smooth.current).current

  // Section-aligned tint stops: ONE continuous palette shared by the
  // nebula washes and the dust, measured from real section positions.
  const [stops, setStops] = useState<TintStop[]>(fallbackStops)
  const stopsRef = useRef(stops)
  stopsRef.current = stops
  const scrollHeightRef = useRef(0)
  const frameCount = useRef(0)
  const getTint = useRef((t: number, out: THREE.Color) =>
    tintAtStops(stopsRef.current, t, out),
  ).current

  useEffect(() => {
    const measure = () => {
      scrollHeightRef.current = document.documentElement.scrollHeight
      setStops(measureStops())
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('load', measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('load', measure)
    }
  }, [])

  useFrame((state) => {
    // Critically-damped pointer smoothing — follows the cursor everywhere,
    // no dead zone at centre, no snap at the edges.
    smooth.current.x += (state.pointer.x - smooth.current.x) * 0.08
    smooth.current.y += (state.pointer.y - smooth.current.y) * 0.08
    const { x, y } = smooth.current

    // Scroll flythrough: the camera dollies forward through the field.
    const progress = getScroll()
    state.camera.position.z = CAMERA_START_Z - progress * CAMERA_TRAVEL
    // Translation parallax on the camera itself (opposite the cursor).
    state.camera.position.x = -x * 0.55
    state.camera.position.y = -y * 0.35
    state.camera.lookAt(
      x * 0.9,
      y * 0.55,
      state.camera.position.z - 12,
    )

    // Depth-layered translation: near dust shifts hardest, far barely.
    if (nearLayer.current) {
      nearLayer.current.position.x = x * 1.15
      nearLayer.current.position.y = y * 0.7
    }
    if (farLayer.current) {
      farLayer.current.position.x = x * 0.3
      farLayer.current.position.y = y * 0.18
    }

    // Layout can shift after mount (fonts, filters, the More-projects
    // shelf) — re-align the tint stops whenever total height changes.
    frameCount.current++
    if (frameCount.current % 60 === 0) {
      const scrollHeight = document.documentElement.scrollHeight
      if (scrollHeight !== scrollHeightRef.current) {
        scrollHeightRef.current = scrollHeight
        setStops(measureStops())
      }
    }
  })

  const farCount = Math.round(particleBudget * 0.55)
  const nearCount = Math.round(particleBudget * 0.45)

  return (
    <>
      <group ref={farLayer}>
        <Dust
          count={farCount}
          spread={[30, 16, 90]}
          zCenter={-30}
          size={0.8}
          pixelRatio={pixelRatio}
          getScroll={getScroll}
          getTint={getTint}
        />
      </group>
      <group ref={nearLayer}>
        <Dust
          count={nearCount}
          spread={[24, 13, 86]}
          zCenter={-28}
          size={1.35}
          pixelRatio={pixelRatio}
          getScroll={getScroll}
          getTint={getTint}
        />
      </group>
      <Atmosphere isMobile={isMobile} stops={stops} />
      <Constellation getPointer={getPointer} />
      <SectionAccents getPointer={getPointer} />
    </>
  )
}

/** Persistent fixed canvas behind every section — one shared render loop. */
export default function SceneCanvas({
  active,
  particleBudget,
  isMobile,
  getScroll,
}: SceneCanvasProps) {
  return (
    <Canvas
      className="scene-webgl"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, CAMERA_START_Z], fov: 55, near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
    >
      <Rig particleBudget={particleBudget} isMobile={isMobile} getScroll={getScroll} />
    </Canvas>
  )
}
