import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './marquee.css'

interface MarqueeProps {
  items: string[]
  direction: 1 | -1
  variant?: 'accent' | 'plain'
}

/**
 * Infinite horizontal ticker. Items are duplicated in markup so the loop is
 * seamless; scroll speed briefly boosts the ticker speed. Frozen (CSS-only,
 * no ticker) under prefers-reduced-motion.
 */
export default function Marquee({ items, direction, variant }: MarqueeProps) {
  const reduced = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const track = trackRef.current
    if (!track) return

    let x = 0
    let lastScrollY = window.scrollY
    let scrollVelocity = 0

    const onScroll = () => {
      scrollVelocity = window.scrollY - lastScrollY
      lastScrollY = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const onTick = () => {
      const half = track.scrollWidth / 2
      x -= (0.5 + Math.abs(scrollVelocity) * 0.03) * direction
      scrollVelocity *= 0.9
      if (direction > 0 && x <= -half) x += half
      if (direction < 0 && x >= 0) x -= half
      track.style.transform = `translateX(${x}px)`
    }
    gsap.ticker.add(onTick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      gsap.ticker.remove(onTick)
    }
  }, [reduced, direction])

  const loop = [...items, ...items]

  return (
    <div className={`marquee ${variant === 'accent' ? 'accent' : ''}`} aria-hidden="true">
      <div ref={trackRef} className="mq-track">
        {loop.map((item, i) => (
          <span key={`${item}-${i}`}>{item}</span>
        ))}
      </div>
    </div>
  )
}
