import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Splits a heading into per-character spans (grouped in word masks so lines
 * never break mid-word). The original accessible name is preserved via
 * aria-label on the heading; the spans are aria-hidden. Returns a restore
 * function that puts the original DOM back.
 */
function splitHeading(el: HTMLElement): () => void {
  const text = (el.textContent ?? '').trim()
  const original = el.innerHTML
  el.setAttribute('aria-label', text)

  const wrap = document.createElement('span')
  wrap.setAttribute('aria-hidden', 'true')
  const words = text.split(/\s+/)
  words.forEach((word, wordIndex) => {
    const mask = document.createElement('span')
    mask.className = 'split-mask'
    for (const char of word) {
      const span = document.createElement('span')
      span.className = 'split-char'
      span.textContent = char
      mask.appendChild(span)
    }
    wrap.appendChild(mask)
    if (wordIndex < words.length - 1) wrap.appendChild(document.createTextNode(' '))
  })
  el.innerHTML = ''
  el.appendChild(wrap)

  return () => {
    el.innerHTML = original
    el.removeAttribute('aria-label')
  }
}

/**
 * Scroll-choreographed reveals. Elements opt in with `data-reveal`
 * (rise + fade), `data-reveal-clip` (clip-path wipe) or `data-split`
 * (per-character staggered rise for headings). Compositor-friendly
 * properties only: transform, opacity, clip-path. No-ops under
 * prefers-reduced-motion — content simply stays visible.
 */
export function useReveal<T extends HTMLElement>(enabled: boolean) {
  const scope = useRef<T>(null)

  useEffect(() => {
    if (!enabled || !scope.current) return

    const restores: (() => void)[] = []

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 48,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%' },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-reveal-clip]').forEach((el) => {
        gsap.from(el, {
          clipPath: 'inset(0 100% 0 0)',
          duration: 1.2,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })

      // Parallax drift — ghost numerals (and anything else opting in via
      // data-parallax="speed") travel against the scroll for cheap depth.
      // Transform-only, scrubbed, disabled entirely under reduced motion.
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.dataset.parallax ?? '0.15')
        gsap.fromTo(
          el,
          { yPercent: speed * 100 },
          {
            yPercent: -speed * 100,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })

      // The hero recedes as you scroll past it — content sinks and fades
      // slightly slower than the page, giving the exit a layer of depth.
      if (document.querySelector('.hero-inner')) {
        gsap.to('.hero-inner', {
          yPercent: -14,
          autoAlpha: 0.15,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        })
      }

      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        restores.push(splitHeading(el))
        gsap.from(el.querySelectorAll('.split-char'), {
          yPercent: 115,
          duration: 0.9,
          ease: 'power4.out',
          stagger: 0.035,
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })
    }, scope)

    return () => {
      ctx.revert()
      restores.forEach((restore) => restore())
    }
  }, [enabled])

  return scope
}
