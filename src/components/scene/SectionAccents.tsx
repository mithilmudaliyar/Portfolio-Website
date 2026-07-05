import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ACCENT = '#35e0f2'

/** Where each section's 3D accent lives along the camera's -z flight path. */
export const ACCENT_REGIONS = [
  { id: 'about', z: -14, x: -3.2, y: 0.6 },
  { id: 'work', z: -28, x: 3.4, y: -0.4 },
  { id: 'case-studies', z: -42, x: -3.0, y: 0.2 },
  { id: 'contact', z: -54, x: 2.6, y: 0.8 },
] as const

const FADE_RANGE = 11
const AHEAD_OFFSET = 7 // accents sit this far ahead of the camera when "on"

interface SectionAccentsProps {
  getPointer: () => { x: number; y: number }
}

interface AccentProps {
  region: (typeof ACCENT_REGIONS)[number]
  getPointer: () => { x: number; y: number }
  children: (material: React.RefObject<THREE.Material | null>) => React.ReactNode
  spin?: [number, number]
}

/**
 * A single accent: fades in as the camera approaches its region (proximity
 * drives opacity — a scrubbed reveal, since the camera itself is
 * scroll-driven), rotates slowly, and depth-parallaxes with the cursor.
 */
function Accent({ region, getPointer, children, spin = [0.1, 0.16] }: AccentProps) {
  const group = useRef<THREE.Group>(null)
  const material = useRef<THREE.Material | null>(null)

  useFrame((state, delta) => {
    if (!group.current) return
    const pointer = getPointer()
    group.current.rotation.x += delta * spin[0]
    group.current.rotation.y += delta * spin[1]
    // Cursor depth-parallax — accents are mid-depth, factor between layers.
    group.current.position.x = region.x + pointer.x * 0.7
    group.current.position.y = region.y + pointer.y * 0.45
    // Proximity fade: fully visible when the camera is AHEAD_OFFSET away.
    const distance = Math.abs(state.camera.position.z - (region.z + AHEAD_OFFSET))
    const opacity = THREE.MathUtils.clamp(1 - distance / FADE_RANGE, 0, 1)
    if (material.current) {
      material.current.opacity = opacity * 0.5
      material.current.visible = opacity > 0.01
    }
  })

  return (
    <group ref={group} position={[region.x, region.y, region.z]}>
      {children(material)}
    </group>
  )
}

/** One subtle wireframe/cluster accent per content section. */
export default function SectionAccents({ getPointer }: SectionAccentsProps) {
  const clusterOffsets = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2
        return [Math.cos(angle) * 0.9, Math.sin(angle * 1.7) * 0.6, Math.sin(angle) * 0.7] as const
      }),
    [],
  )

  return (
    <>
      {/* About — slow icosahedron wireframe */}
      <Accent region={ACCENT_REGIONS[0]} getPointer={getPointer}>
        {(material) => (
          <mesh>
            <icosahedronGeometry args={[1.5, 1]} />
            <meshBasicMaterial
              ref={material as React.RefObject<THREE.MeshBasicMaterial>}
              color={ACCENT}
              wireframe
              transparent
              opacity={0}
            />
          </mesh>
        )}
      </Accent>

      {/* Work — drifting node cluster sharing one material */}
      <Accent region={ACCENT_REGIONS[1]} getPointer={getPointer} spin={[0.04, 0.1]}>
        {(material) => (
          <group>
            {clusterOffsets.map((offset, i) => (
              <mesh key={i} position={[offset[0], offset[1], offset[2]]}>
                <sphereGeometry args={[0.09, 12, 12]} />
                {i === 0 ? (
                  <meshBasicMaterial
                    ref={material as React.RefObject<THREE.MeshBasicMaterial>}
                    color={ACCENT}
                    transparent
                    opacity={0}
                  />
                ) : (
                  <meshBasicMaterial color={ACCENT} transparent opacity={0.22} />
                )}
              </mesh>
            ))}
          </group>
        )}
      </Accent>

      {/* Case studies — torus knot wireframe, the signature scrubbed moment */}
      <Accent region={ACCENT_REGIONS[2]} getPointer={getPointer} spin={[0.12, 0.2]}>
        {(material) => (
          <mesh>
            <torusKnotGeometry args={[1.1, 0.3, 72, 10]} />
            <meshBasicMaterial
              ref={material as React.RefObject<THREE.MeshBasicMaterial>}
              color={ACCENT}
              wireframe
              transparent
              opacity={0}
            />
          </mesh>
        )}
      </Accent>

      {/* Contact — thin ring */}
      <Accent region={ACCENT_REGIONS[3]} getPointer={getPointer} spin={[0.18, 0.06]}>
        {(material) => (
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[1.6, 0.02, 12, 64]} />
            <meshBasicMaterial
              ref={material as React.RefObject<THREE.MeshBasicMaterial>}
              color={ACCENT}
              transparent
              opacity={0}
            />
          </mesh>
        )}
      </Accent>
    </>
  )
}
