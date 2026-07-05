import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { projects, TRACK_LABELS } from '../../lib/projects'

const ACCENT = new THREE.Color('#35e0f2')

interface ConstellationProps {
  getPointer: () => { x: number; y: number }
}

/** Deterministic golden-angle spiral — nodes spread evenly, never clump. */
function nodePositions(count: number): THREE.Vector3[] {
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
  const positions: THREE.Vector3[] = []
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1)
    const angle = i * GOLDEN_ANGLE
    const radius = 1.7 + t * 2.5
    positions.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        (t - 0.5) * 3.2 + Math.sin(angle * 2) * 0.4,
        Math.sin(angle) * radius * 0.7,
      ),
    )
  }
  return positions
}

/** Connect each node to its two nearest neighbours (deduplicated pairs). */
function buildLinks(positions: THREE.Vector3[]): Float32Array {
  const pairs = new Set<string>()
  positions.forEach((pos, i) => {
    const byDistance = positions
      .map((other, j) => ({ j, d: pos.distanceTo(other) }))
      .filter(({ j }) => j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
    byDistance.forEach(({ j }) => pairs.add(i < j ? `${i}-${j}` : `${j}-${i}`))
  })
  const segments = new Float32Array(pairs.size * 6)
  let offset = 0
  pairs.forEach((pair) => {
    const [a, b] = pair.split('-').map(Number)
    segments.set([...positions[a].toArray(), ...positions[b].toArray()], offset)
    offset += 6
  })
  return segments
}

/**
 * The hero project constellation (region 0 of the flythrough). Parallax is
 * translation-first: the whole rig shifts with the smoothed cursor and each
 * node adds a per-depth offset (nearer nodes move more), so the field
 * responds everywhere on screen — not only at the edges.
 */
export default function Constellation({ getPointer }: ConstellationProps) {
  const rig = useRef<THREE.Group>(null)
  const nodeRefs = useRef<(THREE.Group | null)[]>([])
  const [hovered, setHovered] = useState<number | null>(null)

  const nodes = useMemo(() => nodePositions(projects.length), [])
  const links = useMemo(() => buildLinks(nodes), [nodes])

  useFrame(() => {
    const { x, y } = getPointer()
    if (rig.current) {
      // Translation parallax — clearly visible even at screen centre.
      rig.current.position.x = x * 0.9
      rig.current.position.y = y * 0.55
      rig.current.rotation.y = x * 0.24
      rig.current.rotation.x = -y * 0.15
    }
    // Depth parallax: nodes nearer the camera (larger z) shift further.
    nodeRefs.current.forEach((group, i) => {
      if (!group) return
      const depth = nodes[i].z
      group.position.x = nodes[i].x + x * depth * 0.16
      group.position.y = nodes[i].y + y * depth * 0.1
    })
  })

  return (
    <group ref={rig}>
      {/* Constellation lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[links, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.16} />
      </lineSegments>

      {/* Project nodes */}
      {projects.map((project, i) => {
        const isHovered = hovered === i
        return (
          <group
            key={project.id}
            ref={(el) => {
              nodeRefs.current[i] = el
            }}
            position={nodes[i]}
            scale={isHovered ? 1.6 : 1}
          >
            <mesh>
              <sphereGeometry args={[0.075, 16, 16]} />
              <meshBasicMaterial color={isHovered ? '#8df0fa' : ACCENT} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshBasicMaterial color={ACCENT} transparent opacity={isHovered ? 0.3 : 0.14} />
            </mesh>
            {/* Oversized invisible hit target so hovering is forgiving */}
            <mesh
              visible={false}
              onPointerOver={(event) => {
                event.stopPropagation()
                setHovered(i)
              }}
              onPointerOut={() => setHovered(null)}
              onClick={() => document.getElementById('work')?.scrollIntoView()}
            >
              <sphereGeometry args={[0.34, 8, 8]} />
            </mesh>
            {isHovered && (
              <Html center distanceFactor={9} className="node-label-wrap" zIndexRange={[100, 0]}>
                <div className="node-label">
                  <strong>{project.name}</strong>
                  <span>{TRACK_LABELS[project.track]}</span>
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}
