import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects, TRACK_LABELS, SOCIAL } from '../../lib/projects'
import './projects.css'

gsap.registerPlugin(ScrollTrigger)

// Curated signature projects — the rest live on GitHub, linked from the
// closing card so nothing real gets lost, just de-emphasized.
const FEATURED_IDS = [
  'csi-sense',
  'human-fire-smoke-detection',
  'health-care-chatbot',
  'plant-disease-detection',
  'musify',
]

const featured = FEATURED_IDS.map((id) => projects.find((p) => p.id === id)!)

/**
 * Selected Work — a horizontal filmstrip pinned inside vertical scroll.
 * The section pins for its scroll duration; the inner track translates
 * left as you scroll (linear scrub, never eased). Unpins into a plain
 * horizontal-scroll strip under prefers-reduced-motion.
 */
export default function Projects() {
  const outerRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const [current, setCurrent] = useState(1)
  const cardCount = featured.length + 2 // + title panel + closer card

  useEffect(() => {
    const outer = outerRef.current
    const track = trackRef.current
    const fill = fillRef.current
    if (!outer || !track || !fill) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // One source of truth for the scroll distance. The pin length (end) and
      // the track's horizontal travel both read this same `dist`, recomputed
      // each time ScrollTrigger evaluates `end` (every refresh). Driving the
      // track from the pin's own progress guarantees the strip finishes exactly
      // when the pin releases: no blank pinned gap after the last card, no
      // sluggish over-scroll. A separate tween sharing the trigger read the
      // distance at a different point and fell out of sync, pinning for twice
      // the travel and leaving that gap.
      let dist = 0
      const st = ScrollTrigger.create({
        trigger: outer,
        start: 'top top',
        end: () => {
          dist = Math.max(1, track.scrollWidth - window.innerWidth + 88)
          return '+=' + dist
        },
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          track.style.transform = `translate3d(${-dist * self.progress}px, 0, 0)`
          fill.style.transform = `scaleX(${self.progress})`
          setCurrent(Math.min(cardCount, Math.max(1, Math.round(self.progress * (cardCount - 1)) + 1)))
        },
      })

      // ponytail: no separate opacity reveal on the cards. A gsap.from + its own
      // ScrollTrigger on the pinned element fought the pin under Lenis and left
      // the cards stuck at opacity 0. The pin plus horizontal scrub is the
      // entrance; cards just render.

      return () => st.kill()
    })

    // Web fonts change text metrics after first paint. Without a refresh the
    // pin distance stays measured against the fallback font (Anton is far
    // wider) and ends up much longer than the filmstrip's actual travel,
    // leaving a blank pinned gap after the cards. Recompute every trigger's
    // positions once fonts are ready.
    let cancelled = false
    void document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh()
    })

    return () => {
      cancelled = true
      mm.revert()
    }
  }, [cardCount])

  // Keyboard focus brings a card into view by scrolling the page to the
  // matching pin progress — filmstrip stays reachable without a mouse.
  const focusToProgress = (index: number) => {
    const st = ScrollTrigger.getAll().find((s) => s.trigger === outerRef.current)
    if (!st) return
    const p = index / (cardCount - 1)
    window.scrollTo({ top: st.start + (st.end - st.start) * p, behavior: 'auto' })
  }

  return (
    <section id="work" ref={outerRef} className="film-outer" aria-label="Selected work">
      <div ref={trackRef} className="film-track">
        <div className="film-head">
          <div className="lab">02 / Index</div>
          <h2>
            Selected
            <br />
            Work
          </h2>
        </div>

        {featured.map((project, i) => (
          <a
            key={project.id}
            className="film-card"
            data-cursor="view"
            href={project.live ?? project.github}
            target="_blank"
            rel="noopener noreferrer"
            onFocus={() => focusToProgress(i + 1)}
          >
            <div className="num">{String(i + 1).padStart(2, '0')}</div>
            <div>
              <span className="tag">{TRACK_LABELS[project.track]}</span>
              <h3>{project.name}</h3>
              <p>{project.outcome}</p>
            </div>
            <div className="aff">View on GitHub →</div>
          </a>
        ))}

        <a
          className="film-card film-card--more"
          data-cursor="view"
          href={SOCIAL.github}
          target="_blank"
          rel="noopener noreferrer"
          onFocus={() => focusToProgress(featured.length + 1)}
        >
          <div className="num">+{projects.length - featured.length}</div>
          <div>
            <span className="tag">Full Archive</span>
            <h3>More on GitHub</h3>
            <p>The rest of the builds, from foundations to web and AI/ML experiments, live on my profile.</p>
          </div>
          <div className="aff">Browse GitHub →</div>
        </a>
      </div>

      <div className="film-hud">
        <span className="film-idx">
          <b>{String(current).padStart(2, '0')}</b> / {String(cardCount).padStart(2, '0')}
        </span>
        <div className="film-bar">
          <span ref={fillRef} />
        </div>
        <span className="film-hint">Scroll to move through the work</span>
      </div>
    </section>
  )
}
