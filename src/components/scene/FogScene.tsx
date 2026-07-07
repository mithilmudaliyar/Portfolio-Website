import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * Flowing ember fog — a single full-viewport plane running a domain-warped
 * fbm-noise fragment shader. No geometry cost, no particles, no blobs:
 * just slow warm smoke lit by faint firelight veins that drift with time,
 * pull toward the cursor, and shift hue as the page scrolls.
 *
 * All animation is in the fragment shader on one quad, so it stays smooth.
 * dpr is capped by the parent; the parent also gates frameloop so nothing
 * ticks while the tab is hidden or motion is reduced.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uScroll;

  // warm palette
  const vec3 ASH   = vec3(0.078, 0.063, 0.051); // #141010 charcoal
  const vec3 SMOKE = vec3(0.145, 0.110, 0.090); // warm graphite
  const vec3 EMBER = vec3(0.886, 0.416, 0.220); // #e26a38
  const vec3 OXBLD = vec3(0.42, 0.13, 0.10);    // deep oxblood

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                   dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(uv.x * aspect, uv.y) * 2.2;
    float t = uTime * 0.045;

    // cursor pull — the fog leans gently toward the pointer
    vec2 m = vec2(uMouse.x * aspect, uMouse.y);
    p += (m - vec2(aspect, 1.0)) * 0.12 * uMouse.x;

    // domain warp: two layers of fbm feeding the next
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 2.0 * q + vec2(1.7, 9.2) + 0.5 * t),
                  fbm(p + 2.0 * q + vec2(8.3, 2.8) - 0.3 * t));
    float f = fbm(p + 2.0 * r + uScroll * 0.35);

    // base smoke, deepening in the troughs
    vec3 col = mix(ASH, SMOKE, clamp(f * 1.4 + 0.3, 0.0, 1.0));
    // oxblood in the warp valleys for depth
    col = mix(col, OXBLD, clamp(pow(length(q) * 0.5, 2.0) * 0.35, 0.0, 0.28));
    // ember firelight veins where the warp peaks — scroll shifts intensity
    float veins = pow(clamp(r.x * 0.5 + 0.55, 0.0, 1.0), 3.5);
    col = mix(col, EMBER, veins * (0.22 + 0.12 * sin(uScroll * 2.0 + uTime * 0.2)));

    // soft warm glow toward the cursor
    float glow = smoothstep(0.55, 0.0, distance(uv, uMouse));
    col += EMBER * glow * 0.05;

    // vignette so edges sink into the dark — keeps text readable
    float vig = smoothstep(1.15, 0.35, distance(uv, vec2(0.5)));
    col *= 0.55 + 0.45 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`

function FogPlane({ animate }: { animate: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()
  const mouse = useRef(new THREE.Vector2(0.5, 0.5))
  const scroll = useRef(0)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
    }),
    // size handled in useFrame; recreating uniforms on resize would reset time
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state, delta) => {
    const m = material.current
    if (!m) return
    // pointer/scroll read from window (fixed full-screen plane)
    const px = (state.pointer.x + 1) / 2
    const py = (state.pointer.y + 1) / 2
    mouse.current.lerp(new THREE.Vector2(px, py), 0.05)
    const max = document.documentElement.scrollHeight - window.innerHeight
    const target = max > 0 ? window.scrollY / max : 0
    scroll.current += (target - scroll.current) * 0.08

    m.uniforms.uMouse.value.copy(mouse.current)
    m.uniforms.uScroll.value = scroll.current
    m.uniforms.uRes.value.set(state.size.width, state.size.height)
    // advance time only when animating; static frame still renders once
    if (animate) m.uniforms.uTime.value += delta
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

interface FogSceneProps {
  active: boolean
  animate: boolean
}

export default function FogScene({ active, animate }: FogSceneProps) {
  return (
    <Canvas
      className="scene-webgl"
      frameloop={active ? 'always' : 'demand'}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 1] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <FogPlane animate={animate} />
    </Canvas>
  )
}
