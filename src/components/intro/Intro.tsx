import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const EXIT_DURATION_MS = 450
const MIN_SHOW_MS = 700
const MAX_WAIT_MS = 2500

/**
 * Preloader driven by REAL milestones — web fonts ready and the window
 * load event — with a counter that eases toward the actual percentage.
 * Focus is trapped on the (only focusable) skip button; Escape also skips.
 * Skipped automatically under prefers-reduced-motion.
 */
export default function Intro({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const targetRef = useRef(0)
  const doneRef = useRef(false)
  const skipRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (reduced) {
      onDone()
      return
    }

    const startedAt = performance.now()
    const milestones = 2
    let completed = 0
    const bump = () => {
      completed += 1
      targetRef.current = Math.round((completed / milestones) * 100)
    }

    document.fonts.ready.then(bump).catch(bump)
    if (document.readyState === 'complete') bump()
    else window.addEventListener('load', bump, { once: true })

    // Never hold the user hostage on a slow network.
    const forceTimer = setTimeout(() => {
      targetRef.current = 100
    }, MAX_WAIT_MS)

    let rafId = 0
    const tick = () => {
      setDisplay((current) => {
        const next = current + Math.max(1, (targetRef.current - current) * 0.12)
        return Math.min(100, targetRef.current > current ? next : current)
      })
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const check = setInterval(() => {
      const elapsed = performance.now() - startedAt
      if (targetRef.current >= 100 && elapsed >= MIN_SHOW_MS) finish()
    }, 100)

    skipRef.current?.focus()

    return () => {
      clearTimeout(forceTimer)
      clearInterval(check)
      cancelAnimationFrame(rafId)
      window.removeEventListener('load', bump)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setLeaving(true)
    setTimeout(onDone, EXIT_DURATION_MS)
  }

  // Focus trap: the skip button is the only focusable element in the
  // overlay — keep Tab cycling on it; Escape skips.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      skipRef.current?.focus()
    }
    if (event.key === 'Escape') finish()
  }

  if (reduced) return null

  const percent = Math.round(display)

  return (
    <div
      className={`intro ${leaving ? 'is-leaving' : ''}`}
      role="status"
      aria-label="Loading portfolio"
      onKeyDown={onKeyDown}
    >
      <p className="intro-mark" aria-hidden="true">
        MM<em>·</em>
      </p>
      <div className="intro-bar" aria-hidden="true">
        <span style={{ transform: `translateX(${percent - 100}%)` }} />
      </div>
      <p className="intro-count" aria-hidden="true">
        {percent}%
      </p>
      <button ref={skipRef} className="intro-skip" type="button" onClick={finish}>
        Skip intro
      </button>
    </div>
  )
}
