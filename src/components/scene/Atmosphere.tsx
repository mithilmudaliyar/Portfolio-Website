import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { depthAt, type TintStop } from './tintJourney'

const nebulaVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/* Soft two-lobe radial wash textured with fbm clouds. The rnd/noise/fbm
   chain is ported from the shader in the vendored animated-shader-hero
   (src/vendor/21st/animated-shader-hero.tsx, GLSL by Matthias Hurrle /
   @atzedent), capped at 4 octaves + a light domain warp so the washes
   stay cheap enough for the mobile budget. */
const nebulaFragment = /* glsl */ `
uniform vec3 uTint;
uniform float uTime;
uniform float uOpacity;
varying vec2 vUv;

float rnd(vec2 p) {
  p = fract(p * vec2(12.9898, 78.233));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  float a = rnd(i);
  float b = rnd(i + vec2(1.0, 0.0));
  float c = rnd(i + vec2(0.0, 1.0));
  float d = rnd(i + 1.0);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float t = 0.0, a = 1.0;
  mat2 m = mat2(1.0, -0.5, 0.2, 1.2);
  for (int i = 0; i < 4; i++) {
    t += a * noise(p);
    p *= 2.0 * m;
    a *= 0.5;
  }
  return t;
}

void main() {
  vec2 p = vUv - 0.5;
  float t = uTime * 0.03;
  // Domain warp — gives the wash a curling, cloud-like interior.
  p += 0.22 * vec2(noise(p * 4.0 + t), noise(p * 4.0 - t));
  float n = fbm(p * 3.0 + t) * 0.53; // fbm(4 octaves) maxes ~1.875 → ~0..1
  float lobes = exp(-dot(p, p) * 7.0) + 0.55 * exp(-dot(p - vec2(0.18, -0.12), p - vec2(0.18, -0.12)) * 16.0);
  float a = lobes * (0.4 + 0.6 * n) * uOpacity;
  gl_FragColor = vec4(uTint, a);
}
`

interface WashProps {
  position: [number, number, number]
  scale: number
  tint: THREE.Color
  opacity: number
}

function NebulaWash({ position, scale, tint, opacity }: WashProps) {
  const material = useRef<THREE.ShaderMaterial>(null)
  // Uniform objects are created once; values are synced below so
  // re-measured stops (new Color instances) actually take effect.
  const uniforms = useMemo(
    () => ({
      uTint: { value: tint },
      uTime: { value: 0 },
      uOpacity: { value: opacity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    if (!material.current) return
    material.current.uniforms.uTint.value = tint
    material.current.uniforms.uOpacity.value = opacity
  }, [tint, opacity])

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        vertexShader={nebulaVertex}
        fragmentShader={nebulaFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

const STREAK_COUNT_DESKTOP = 10
const STREAK_COUNT_MOBILE = 4

interface AtmosphereProps {
  isMobile: boolean
  /** Section-aligned palette stops — the same journey the dust tint reads. */
  stops: TintStop[]
}

/**
 * The secondary layer that keeps the flythrough from reading as empty
 * space: one tinted nebula wash per palette stop (positioned at that
 * stop's measured camera depth, so washes always sit over their sections
 * — including the amber hold over the footer) and a sparse set of
 * drifting light streaks. All additive, depth-write off.
 */
export default function Atmosphere({ isMobile, stops }: AtmosphereProps) {
  const streaksRef = useRef<THREE.Group>(null)

  const streaks = useMemo(() => {
    const count = isMobile ? STREAK_COUNT_MOBILE : STREAK_COUNT_DESKTOP
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 10,
        -6 - Math.random() * 52,
      ] as [number, number, number],
      length: 1.6 + Math.random() * 3.4,
      tilt: (Math.random() - 0.5) * 0.5,
      speed: 0.25 + Math.random() * 0.5,
      phase: i * 1.37,
    }))
  }, [isMobile])

  useFrame((state) => {
    // Streaks drift laterally and pulse — cheap sine motion, no physics.
    const t = state.clock.elapsedTime
    streaksRef.current?.children.forEach((child, i) => {
      const s = streaks[i]
      child.position.x = s.position[0] + Math.sin(t * s.speed + s.phase) * 1.6
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
      material.opacity = 0.05 + 0.05 * (0.5 + 0.5 * Math.sin(t * s.speed * 2.0 + s.phase))
    })
  })

  // One wash per stop, sitting a little ahead of where the camera is when
  // that stop's section is centred; off-axis so text stays over dark space.
  const washes = stops.map((stop, i) => ({
    position: [i % 2 === 0 ? 3.5 : -3.6, i % 2 === 0 ? 1.2 : -0.9, depthAt(stop.t) - 6] as [
      number,
      number,
      number,
    ],
    tint: stop.color,
  }))

  return (
    <>
      {washes.map((wash, i) => (
        <NebulaWash
          key={i}
          position={wash.position}
          scale={isMobile ? 14 : 20}
          tint={wash.tint}
          opacity={isMobile ? 0.14 : 0.18}
        />
      ))}
      <group ref={streaksRef}>
        {streaks.map((streak, i) => (
          <mesh key={i} position={streak.position} rotation={[0, 0, streak.tilt]}>
            <planeGeometry args={[streak.length, 0.015]} />
            <meshBasicMaterial
              color="#9adfef"
              transparent
              opacity={0.07}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </>
  )
}
