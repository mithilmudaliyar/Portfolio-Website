import { useMagnetic } from '../../hooks/useMagnetic'
import './hero.css'

/**
 * Hero content only — the 3D constellation behind it lives in the
 * page-level SceneBackground (region 0 of the flythrough). Text renders
 * immediately, so LCP never waits on WebGL.
 */
export default function Hero({ ready }: { ready: boolean }) {
  const magnetPrimary = useMagnetic<HTMLAnchorElement>()
  const magnetGhost = useMagnetic<HTMLAnchorElement>()

  return (
    <section id="hero" className={`hero ${ready ? 'is-ready' : ''}`} aria-label="Introduction">
      <div className="container hero-inner">
        <p className="kicker hero-kicker">Full-Stack &amp; AI/ML Developer</p>
        <h1 className="hero-title">
          <span className="hero-line">
            <span className="hero-line-inner">Mithil</span>
          </span>
          <span className="hero-line hero-line--offset">
            <span className="hero-line-inner">
              Mudaliyar<em>.</em>
            </span>
          </span>
        </h1>
        <div className="hero-meta">
          <p className="hero-tagline">
            I build machine-learning systems and web experiences that solve real problems —
            from disease-detecting vision models to ad-free music streaming.
          </p>
          <div className="hero-ctas">
            <a ref={magnetPrimary} className="btn btn--primary" href="#work">
              View Work
            </a>
            <a ref={magnetGhost} className="btn btn--ghost" href="#contact">
              Get in touch
            </a>
          </div>
        </div>
      </div>

      <a className="hero-scroll-cue" href="#about" aria-label="Scroll to the about section">
        <span className="hero-scroll-line" aria-hidden="true" />
        Scroll
      </a>
    </section>
  )
}
