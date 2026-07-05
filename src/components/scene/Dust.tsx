import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dustVertex, dustFragment } from '../hero/shaders'

const ACCENT = new THREE.Color('#35e0f2')
const WHITE = new THREE.Color('#ededef')

interface DustProps {
  count: number
  /** Box the particles fill: [width, height, depth] */
  spread: [number, number, number]
  /** Depth centre of the box (camera travels along -z) */
  zCenter?: number
  /** Base point size multiplier — near layers use larger, softer points */
  size?: number
  pixelRatio: number
  /** When provided (with getTint), the accent tint follows the journey */
  getScroll?: () => number
  /** Section-aligned palette lookup shared with the nebula washes */
  getTint?: (t: number, out: THREE.Color) => THREE.Color
}

/**
 * One reusable glow-dust cloud driven by the shared GLSL shader. The page
 * renders two of these at different depths/sizes so cursor and scroll
 * parallax read as true 3D layers.
 */
export default function Dust({
  count,
  spread,
  zCenter = 0,
  size = 1,
  pixelRatio,
  getScroll,
  getTint,
}: DustProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const tint = useMemo(() => ACCENT.clone(), [])

  const attributes = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const seeds = new Float32Array(count)
    const tints = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread[0]
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread[1]
      positions[i * 3 + 2] = zCenter + (Math.random() - 0.5) * spread[2]
      scales[i] = (0.4 + Math.random() * 1.3) * size
      seeds[i] = Math.random()
      tints[i] = Math.random() < 0.14 ? 1 : 0
    }
    return { positions, scales, seeds, tints }
  }, [count, spread, zCenter, size])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uColorA: { value: WHITE },
      uColorB: { value: ACCENT },
    }),
    [pixelRatio],
  )

  useFrame((state) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    // Tinted particles follow the journey palette as the camera travels.
    if (getScroll && getTint) {
      materialRef.current.uniforms.uColorB.value = getTint(getScroll(), tint)
    }
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attributes.positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[attributes.scales, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[attributes.seeds, 1]} />
        <bufferAttribute attach="attributes-aTint" args={[attributes.tints, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
