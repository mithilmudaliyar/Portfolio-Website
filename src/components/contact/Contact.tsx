import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { SOCIAL } from '../../lib/projects'
import './contact.css'

gsap.registerPlugin(ScrollTrigger)

const TOAST_MS = 2200

type CopyState = 'idle' | 'copied' | 'failed'

export default function Contact() {
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const timerRef = useRef<number>(0)
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  useEffect(() => {
    if (reduced || !sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.to('.contact .msk', {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1,
        ease: 'power4.inOut',
        stagger: 0.12,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

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
    <section id="contact" ref={sectionRef} className="contact" aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="contact-headline">
        <span className="hero-line">
          <span className="msk">Let's build something</span>
        </span>
        <span className="hero-line">
          <span className="msk acc">worth shipping.</span>
        </span>
      </h2>

      <p className="contact-sub">
        I'm open to full time roles and collaborations, especially anything that puts machine
        learning behind a great interface.
      </p>

      <div className="contact-ctas">
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

      <div className="contact-email-row">
        <a className="contact-email" href={`mailto:${SOCIAL.email}`}>
          {SOCIAL.email}
        </a>
        <button
          type="button"
          className="contact-copy"
          data-cursor="copy"
          onClick={copyEmail}
          aria-label="Copy email address to clipboard"
        >
          Copy
        </button>
      </div>

      {/* Toast — role=status announces politely without stealing focus */}
      <div className={`copy-toast ${copyState !== 'idle' ? 'is-visible' : ''}`} role="status" aria-live="polite">
        {copyState === 'copied' && 'Email copied to clipboard'}
        {copyState === 'failed' && 'Copy failed, use the email link'}
      </div>
    </section>
  )
}
