import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const STORAGE_KEY = 'observatory-sound'
const AMBIENT_GAIN = 0.035
const TICK_GAIN = 0.05

/**
 * Optional ambience: a very quiet detuned drone plus soft ticks when
 * hovering interactive elements. OFF by default, persisted in
 * localStorage, hidden entirely under prefers-reduced-motion. Everything
 * is synthesized with WebAudio — no audio assets shipped.
 */
export default function SoundControl() {
  const reduced = useReducedMotion()
  const [on, setOn] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const stopRef = useRef<(() => void) | null>(null)

  // Restore persisted preference (still requires this click-toggle UI to
  // have been used before — browsers need a gesture to start audio).
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'on') setOn(true)
  }, [])

  useEffect(() => {
    if (!on || reduced) {
      stopRef.current?.()
      stopRef.current = null
      return
    }

    const ctx = ctxRef.current ?? new AudioContext()
    ctxRef.current = ctx
    void ctx.resume()

    // Ambient pad: two barely-detuned sines through a dark lowpass.
    const master = ctx.createGain()
    master.gain.value = 0
    master.gain.linearRampToValueAtTime(AMBIENT_GAIN, ctx.currentTime + 1.2)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 220
    const oscA = ctx.createOscillator()
    const oscB = ctx.createOscillator()
    oscA.frequency.value = 55
    oscB.frequency.value = 55.7
    oscA.connect(filter)
    oscB.connect(filter)
    filter.connect(master)
    master.connect(ctx.destination)
    oscA.start()
    oscB.start()

    // Hover ticks on interactive elements (delegated).
    const tick = () => {
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(TICK_GAIN, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08)
      const osc = ctx.createOscillator()
      osc.frequency.value = 1100
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.09)
    }
    const onOver = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('a, button')) tick()
    }
    document.addEventListener('mouseover', onOver, { passive: true })

    stopRef.current = () => {
      document.removeEventListener('mouseover', onOver)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
      setTimeout(() => {
        oscA.stop()
        oscB.stop()
      }, 400)
    }
    return () => {
      stopRef.current?.()
      stopRef.current = null
    }
  }, [on, reduced])

  if (reduced) return null

  const toggle = () => {
    const next = !on
    setOn(next)
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
  }

  return (
    <button
      type="button"
      className={`sound-toggle ${on ? 'is-on' : ''}`}
      aria-pressed={on}
      onClick={toggle}
    >
      <span className="sound-bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      Sound {on ? 'on' : 'off'}
    </button>
  )
}
