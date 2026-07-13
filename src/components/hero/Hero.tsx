import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './hero.css'

/**
 * Hero — a 4-line Anton headline that mask-reveals line by line (clip-path
 * wipe, never a fade), then the kicker and bio settle in. Text renders
 * immediately so LCP never waits on the animation.
 */
export default function Hero({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ready || reduced || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.to('.hero-line:nth-child(1) .msk', { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power4.inOut' }, 0.1)
        .to(
          '.hero-line:nth-child(2) .msk',
          { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power4.inOut', stagger: 0.08 },
          0.3,
        )
        .to('.hero-line:nth-child(3) .msk', { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power4.inOut' }, 0.5)
        .to(
          '.hero-line:nth-child(4) .msk',
          { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power4.inOut', stagger: 0.08 },
          0.7,
        )
        .to('.hero-kicker', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.15)
        .to('.hero-sub', { opacity: 1, duration: 0.8, ease: 'power3.out' }, 1.15)
    }, sectionRef)

    return () => ctx.revert()
  }, [ready, reduced])

  return (
    <section id="hero" ref={sectionRef} className={`hero ${ready ? 'is-ready' : ''}`} aria-label="Introduction">
      <div className="container hero-inner">
        <p className="kicker hero-kicker">Mithil Mudaliyar</p>
        <h1 className="hero-title" aria-label="Machines that learn. Interfaces that move.">
          <span className="hero-line">
            <span className="msk">Machines</span>
          </span>
          <span className="hero-line">
            <span className="msk out">that</span> <span className="msk acc">learn.</span>
          </span>
          <span className="hero-line">
            <span className="msk">Interfaces</span>
          </span>
          <span className="hero-line">
            <span className="msk out">that</span> <span className="msk">move.</span>
          </span>
        </h1>
        <p className="hero-sub">
          Full stack and AI/ML developer. I build machine learning systems and the interfaces
          around them, from a vision model that flags plant disease to a music app with no ads.
        </p>
      </div>

      <a className="hero-scroll-cue" href="#about" aria-label="Scroll to the about section">
        <span className="hero-scroll-line" aria-hidden="true" />
        Scroll to explore
      </a>
    </section>
  )
}
