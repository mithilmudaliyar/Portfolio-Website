import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useScrollProgress } from '../../hooks/useScrollProgress'

const HALO_COUNT = 260

/** Per-section composed poses the object interpolates between: [progress, x, y, scale, wireOpacity]. */
const BEATS: [number, number, number, number, number][] = [
  [0.0, 1.9, 0.15, 1.0, 0.55], // hero — right of headline
  [0.22, 1.7, -0.1, 0.92, 0.6], // about — panel floats left, object right
  [0.45, 0.0, 1.15, 0.58, 0.38], // work filmstrip — shrink, rise behind title
  [0.72, -1.8, -0.05, 0.9, 0.6], // approach — panel floats right, object left
  [1.0, 0.0, 0.1, 0.95, 0.7], // contact — centered close
]

function beatLerp(p: number): [number, number, number, number] {
  let a = BEATS[0]
  let b = BEATS[BEATS.length - 1]
  for (let i = 0; i < BEATS.length - 1; i++) {
    if (p >= BEATS[i][0] && p <= BEATS[i + 1][0]) {
      a = BEATS[i]
      b = BEATS[i + 1]
      break
    }
  }
  const span = b[0] - a[0] || 1
  let t = (p - a[0]) / span
  t = t * t * (3 - 2 * t) // smoothstep
  return [
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
    a[4] + (b[4] - a[4]) * t,
  ]
}

/**
 * The signature element: a wireframe icosahedron that lives behind the
 * whole page, morphs by noise, and moves through composed per-section
 * poses driven by scroll progress. Mounts once and never unmounts.
 * Dims itself when it would overlap the hero headline (legibility guard).
 */
export default function Scene3D({ active }: { active: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const getScrollProgress = useScrollProgress()
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const fine = window.matchMedia('(pointer: fine)').matches
    let mouseX = 0
    let mouseY = 0
    let targetMouseX = 0
    let targetMouseY = 0

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 5.2
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    renderer.setSize(window.innerWidth, window.innerHeight)
    host.appendChild(renderer.domElement)

    const geo = new THREE.IcosahedronGeometry(1.4, 1)
    const basePos = geo.attributes.position.array.slice()
    const core = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: 0x0b0c14,
        metalness: 0.7,
        roughness: 0.25,
        flatShading: true,
        emissive: 0x0a1640,
        emissiveIntensity: 0.45,
      }),
    )
    let wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x5c8cff, transparent: true, opacity: 0.55 }),
    )
    const group = new THREE.Group()
    group.add(core)
    group.add(wire)
    scene.add(group)

    const p1 = new THREE.PointLight(0x5c8cff, 2.4, 20)
    p1.position.set(3, 2, 4)
    scene.add(p1)
    const p2 = new THREE.PointLight(0xff5db1, 1.1, 20)
    p2.position.set(-4, -2, 2)
    scene.add(p2)
    scene.add(new THREE.AmbientLight(0x223344, 0.6))

    const haloPositions = new Float32Array(HALO_COUNT * 3)
    for (let i = 0; i < HALO_COUNT; i++) {
      const r = 2.3 + Math.random() * 1.9
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      haloPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      haloPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      haloPositions[i * 3 + 2] = r * Math.cos(phi)
    }
    const haloGeo = new THREE.BufferGeometry()
    haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPositions, 3))
    const halo = new THREE.Points(
      haloGeo,
      new THREE.PointsMaterial({ color: 0x9fb8ff, size: 0.028, transparent: true, opacity: 0.5 }),
    )
    scene.add(halo)

    let heroRect: DOMRect | null = null
    const measureHero = () => {
      const el = document.querySelector<HTMLElement>('.hero-title')
      if (el) heroRect = el.getBoundingClientRect()
    }
    measureHero()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      measureHero()
    }
    window.addEventListener('resize', onResize)

    const onMouseMove = (event: MouseEvent) => {
      targetMouseX = event.clientX / window.innerWidth - 0.5
      targetMouseY = event.clientY / window.innerHeight - 0.5
    }
    if (fine && !reduced) window.addEventListener('mousemove', onMouseMove)

    const introState = { scale: reduced ? 1 : 0.85 }
    requestAnimationFrame(() => {
      host.classList.add('on')
      if (!reduced) {
        gsap.to(introState, { scale: 1, duration: 1.4, ease: 'power3.out', delay: 0.2 })
      }
    })

    const pos = geo.attributes.position
    const clock = new THREE.Clock()
    const projected = new THREE.Vector3()
    let rafId = 0
    let wireOpacity = 0.55

    const tick = () => {
      if (!activeRef.current) {
        rafId = requestAnimationFrame(tick)
        return
      }
      const t = reduced ? 0 : clock.getElapsedTime()
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      const scrollProg = getScrollProgress()
      const amp = 0.12 + scrollProg * 0.55
      for (let i = 0; i < pos.count; i++) {
        const ix = i * 3
        const x = basePos[ix]
        const y = basePos[ix + 1]
        const z = basePos[ix + 2]
        const n = Math.sin(x * 2 + t * 1.2) * Math.cos(y * 2 + t) * Math.sin(z * 2 + t * 0.8)
        const s = 1 + n * amp * 0.28
        pos.array[ix] = x * s
        pos.array[ix + 1] = y * s
        pos.array[ix + 2] = z * s
      }
      pos.needsUpdate = true
      geo.computeVertexNormals()
      wire.geometry.dispose()
      wire.geometry = new THREE.WireframeGeometry(geo)

      const [bx, by, bs, bw] = beatLerp(scrollProg)
      group.rotation.y = t * 0.15 + scrollProg * Math.PI * 2.2 + mouseX * 0.8
      group.rotation.x = mouseY * 0.5 + Math.sin(t * 0.4) * 0.15
      group.scale.setScalar(bs * introState.scale)
      group.position.x = bx + mouseX * 0.4
      group.position.y = by - mouseY * 0.4

      let targetWireOpacity = bw
      if (heroRect && window.scrollY < window.innerHeight) {
        projected.copy(group.position).project(camera)
        const sx = (projected.x * 0.5 + 0.5) * window.innerWidth
        const sy = (-projected.y * 0.5 + 0.5) * window.innerHeight
        const pad = 140
        if (
          sx > heroRect.left - pad &&
          sx < heroRect.right + pad &&
          sy > heroRect.top - pad &&
          sy < heroRect.bottom + pad
        ) {
          targetWireOpacity = Math.min(targetWireOpacity, 0.22)
        }
      }
      wireOpacity += (targetWireOpacity - wireOpacity) * 0.08
      wire.material.opacity = wireOpacity

      halo.rotation.y = -t * 0.05 + scrollProg * 0.8
      halo.position.copy(group.position)
      p1.intensity = 2 + Math.sin(t) * 0.5

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
      geo.dispose()
      haloGeo.dispose()
      host.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return <div ref={hostRef} className={`scene3d ${active ? 'on' : ''}`} />
}
