import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const ACCENT = '#35e0f2'

interface DragState {
  active: boolean
  vx: number
  vy: number
}

/**
 * Drag handling lives on the CANVAS + DOCUMENT — not on the 3D object — so
 * pressing anywhere on the stage and dragging off the graph keeps rotating
 * until release (R3F object events stop firing the moment the cursor
 * leaves the mesh, which is why the old astrolabe drag broke). Same
 * press-and-hold pattern as the D3 globe.
 */
function useCanvasDrag(drag: React.RefObject<DragState>) {
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    const el = gl.domElement
    let lastX = 0
    let lastY = 0

    const onPointerMove = (event: PointerEvent) => {
      if (!drag.current.active) return
      drag.current.vx = (event.clientX - lastX) * 0.005
      drag.current.vy = (event.clientY - lastY) * 0.004
      lastX = event.clientX
      lastY = event.clientY
    }
    const onPointerUp = () => {
      drag.current.active = false
    }
    const onPointerDown = (event: PointerEvent) => {
      drag.current.active = true
      lastX = event.clientX
      lastY = event.clientY
    }

    el.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerUp)
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('pointercancel', onPointerUp)
    }
  }, [gl, drag])
}

const NODE_COUNT = 10 // Python · ML · CV · NLP · React · TS · Node · SQL · Java · Git

/**
 * The lab instrument: my stack mapped as a constellation — a cyan core
 * (the portfolio itself) linked to ten orbiting nodes, spokes plus a few
 * chords between neighbours. Idle motion is a slow spin with per-node
 * breathing; dragging throws the whole graph with inertia.
 */
function StackGraph({ animate, drag }: { animate: boolean; drag: React.RefObject<DragState> }) {
  const assembly = useRef<THREE.Group>(null)
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([])

  const { nodes, edges } = useMemo(() => {
    // Fibonacci-distributed shell with a little radius jitter, so the
    // graph reads organic rather than geodesic.
    const golden = Math.PI * (3 - Math.sqrt(5))
    const nodes = Array.from({ length: NODE_COUNT }, (_, i) => {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2
      const ring = Math.sqrt(1 - y * y)
      const theta = golden * i
      const radius = 1.45 + ((i * 7) % 3) * 0.14
      return new THREE.Vector3(
        Math.cos(theta) * ring,
        y,
        Math.sin(theta) * ring,
      ).multiplyScalar(radius)
    })

    // Spokes from the core to every node, plus chords between neighbours.
    const positions: number[] = []
    for (const node of nodes) positions.push(0, 0, 0, node.x, node.y, node.z)
    for (let i = 0; i < NODE_COUNT; i++) {
      const a = nodes[i]
      const b = nodes[(i + 3) % NODE_COUNT]
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
    return { nodes, edges: new Float32Array(positions) }
  }, [])

  useFrame((state, delta) => {
    if (!assembly.current) return
    const d = drag.current
    assembly.current.rotation.y += d.vx
    assembly.current.rotation.x += d.vy
    d.vx *= d.active ? 0.82 : 0.95
    d.vy *= d.active ? 0.82 : 0.95
    if (animate && !d.active) {
      assembly.current.rotation.y += delta * 0.18
    }
    if (animate) {
      const t = state.clock.elapsedTime
      nodeRefs.current.forEach((mesh, i) => {
        if (mesh) mesh.scale.setScalar(1 + 0.16 * Math.sin(t * 1.6 + i * 1.9))
      })
    }
  })

  return (
    <group ref={assembly} rotation={[0.3, 0.6, 0]}>
      {/* Core — the portfolio node */}
      <mesh>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.85} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color={ACCENT} />
      </mesh>

      {/* Stack nodes — every third one cyan, the rest dim-white */}
      {nodes.map((position, i) => (
        <mesh
          key={i}
          position={position}
          ref={(el) => {
            nodeRefs.current[i] = el
          }}
        >
          <sphereGeometry args={[i % 3 === 0 ? 0.09 : 0.065, 12, 12]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? ACCENT : '#ededef'}
            transparent
            opacity={i % 3 === 0 ? 0.95 : 0.7}
          />
        </mesh>
      ))}

      {/* Edges */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edges, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.28} />
      </lineSegments>
    </group>
  )
}

function Instrument({ animate }: { animate: boolean }) {
  const drag = useRef<DragState>({ active: false, vx: 0, vy: 0 })
  useCanvasDrag(drag)
  return <StackGraph animate={animate} drag={drag} />
}

interface LabSceneProps {
  active: boolean
  animate: boolean
}

export default function LabScene({ active, animate }: LabSceneProps) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: false, alpha: true }}
    >
      <Instrument animate={animate} />
    </Canvas>
  )
}
