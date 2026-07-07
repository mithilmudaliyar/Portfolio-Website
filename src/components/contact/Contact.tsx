import { useEffect, useRef, useState } from 'react'
import { SOCIAL } from '../../lib/projects'
import './contact.css'

const TOAST_MS = 2200

type CopyState = 'idle' | 'copied' | 'failed'

export default function Contact() {
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const timerRef = useRef<number>(0)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SOCIAL.email)
      setCopyState('copied')
    } catch {
      // Clipboard API can be unavailable (permissions, insecure context) —
      // the mailto link right next to this button still works.
      setCopyState('failed')
    }
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setCopyState('idle'), TOAST_MS)
  }

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-heading">
      <span className="section-ghost" aria-hidden="true" data-parallax="0.16">
        04
      </span>
      <div className="container">
        <div className="section-head">
          <span className="section-index" data-reveal>
            04
          </span>
          <h2 className="section-title" data-split>
            Contact
          </h2>
          <span className="head-rule" aria-hidden="true" data-reveal-clip />
        </div>

        <p id="contact-heading" className="contact-headline" data-reveal>
          Let's build something
          <br />
          <em>worth shipping.</em>
        </p>

        <p className="contact-sub" data-reveal>
          Open to full-time roles and collaborations — especially anything that mixes
          machine learning with a great interface.
        </p>

        <div className="contact-ctas" data-reveal>
          <a className="btn btn--primary" href={`mailto:${SOCIAL.email}`}>
            Say hello
          </a>
          <a className="btn btn--ghost" href={SOCIAL.github} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
          <a className="btn btn--ghost" href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn ↗
          </a>
          <a className="btn btn--ghost" href={SOCIAL.resume} download>
            Resume ↓
          </a>
        </div>

        <div className="contact-email-row" data-reveal>
          <a className="contact-email" href={`mailto:${SOCIAL.email}`}>
            {SOCIAL.email}
          </a>
          <button
            type="button"
            className="contact-copy"
            onClick={copyEmail}
            aria-label="Copy email address to clipboard"
          >
            Copy
          </button>
        </div>

        {/* Toast — role=status announces politely without stealing focus */}
        <div
          className={`copy-toast ${copyState !== 'idle' ? 'is-visible' : ''}`}
          role="status"
          aria-live="polite"
        >
          {copyState === 'copied' && 'Email copied to clipboard'}
          {copyState === 'failed' && 'Copy failed — use the mailto link'}
        </div>
      </div>
    </section>
  )
}
