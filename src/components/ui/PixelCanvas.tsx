import * as React from 'react'

/*
 * Adapted from 21st.dev serafimcloud/pixel-canvas (src/vendor/21st/pixel-canvas.tsx).
 * Changes from the vendored original:
 * - listener cleanup actually removes the registered handlers (the original
 *   passed fresh arrow functions to removeEventListener — a no-op)
 * - late-size init fixed: pixels are (re)created the moment the element
 *   actually has a size (ResizeObserver), so cards that mount collapsed or
 *   mid-layout (the "More projects" shelf) still get their texture
 * - an IntersectionObserver fires "appear" when the element scrolls into
 *   view, so the texture shows while scrolling — hover/focus then
 *   intensifies the shimmer instead of being the only trigger
 * - React 19 JSX typing for the <pixel-canvas> custom element
 * - defaults restyled to the site's cyan accent
 * Honours prefers-reduced-motion internally (pixels appear, no shimmer).
 */

const HOVER_INTENSITY = 2.4

class Pixel {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  color: string
  speed: number
  baseSpeed: number
  size = 0
  sizeStep: number
  minSize = 0.5
  maxSizeInteger = 2
  maxSize: number
  delay: number
  counter = 0
  counterStep: number
  isIdle = false
  isReverse = false
  isShimmer = false

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number,
  ) {
    this.ctx = context
    this.x = x
    this.y = y
    this.color = color
    this.speed = (Math.random() * 0.8 + 0.1) * speed
    this.baseSpeed = this.speed
    this.sizeStep = Math.random() * 0.4
    this.maxSize = Math.random() * (this.maxSizeInteger - this.minSize) + this.minSize
    this.delay = delay
    this.counterStep = Math.random() * 4 + (canvas.width + canvas.height) * 0.01
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5
    this.ctx.fillStyle = this.color
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size)
  }

  appear() {
    this.isIdle = false
    if (this.counter <= this.delay) {
      this.counter += this.counterStep
      return
    }
    if (this.size >= this.maxSize) this.isShimmer = true
    if (this.isShimmer) this.shimmer()
    else this.size += this.sizeStep
    this.draw()
  }

  disappear() {
    this.isShimmer = false
    this.counter = 0
    if (this.size <= 0) {
      this.isIdle = true
      return
    }
    this.size -= 0.1
    this.draw()
  }

  shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true
    else if (this.size <= this.minSize) this.isReverse = false
    this.size += this.isReverse ? -this.speed : this.speed
  }
}

class PixelCanvasElement extends HTMLElement {
  private canvas = document.createElement('canvas')
  private ctx = this.canvas.getContext('2d')
  private pixels: Pixel[] = []
  private animation: number | null = null
  private timeInterval = 1000 / 60
  private timePrevious = performance.now()
  private reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private _initialized = false
  private _resizeObserver: ResizeObserver | null = null
  private _intersectionObserver: IntersectionObserver | null = null
  private _parent: Element | null = null
  private _inView = false
  private _hovered = false
  private _lastWidth = 0
  private _lastHeight = 0
  private onEnter = () => {
    this._hovered = true
    this.setIntensity(HOVER_INTENSITY)
    this.handleAnimation('appear')
  }
  private onLeave = () => {
    this._hovered = false
    this.setIntensity(1)
    // Only fade out if the element has also left the viewport — while
    // visible the texture stays on, hover just intensifies it.
    if (!this._inView) this.handleAnimation('disappear')
  }

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = `
      :host {
        display: grid;
        inline-size: 100%;
        block-size: 100%;
        overflow: hidden;
      }
    `
    shadow.appendChild(style)
    shadow.appendChild(this.canvas)
  }

  get colors() {
    // Site default: dim-to-bright cyan, reads as sensor noise on the cards
    return this.dataset.colors?.split(',') || ['#123a40', '#1d7a88', '#35e0f2']
  }

  get gap() {
    const value = Number(this.dataset.gap) || 5
    return Math.max(4, Math.min(50, value))
  }

  get speed() {
    const value = Number(this.dataset.speed) || 35
    return this.reducedMotion ? 0 : Math.max(0, Math.min(100, value)) * 0.001
  }

  get noFocus() {
    return this.hasAttribute('data-no-focus')
  }

  connectedCallback() {
    if (this._initialized) return
    this._initialized = true
    this._parent = this.parentElement

    // (Re)create pixels whenever the element actually has a size — a card
    // that mounts collapsed or mid-layout initialises the moment it opens.
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => this.handleResize())
    })
    ro.observe(this)
    this._resizeObserver = ro
    requestAnimationFrame(() => this.handleResize())

    // Appear while scrolling into view — not only on deliberate hover.
    const io = new IntersectionObserver(
      ([entry]) => {
        this._inView = entry.isIntersecting
        this.handleAnimation(entry.isIntersecting || this._hovered ? 'appear' : 'disappear')
      },
      { threshold: 0.05 },
    )
    io.observe(this)
    this._intersectionObserver = io

    this._parent?.addEventListener('mouseenter', this.onEnter)
    this._parent?.addEventListener('mouseleave', this.onLeave)
    if (!this.noFocus) {
      this._parent?.addEventListener('focus', this.onEnter, { capture: true })
      this._parent?.addEventListener('blur', this.onLeave, { capture: true })
    }
  }

  disconnectedCallback() {
    this._initialized = false
    this._lastWidth = 0
    this._lastHeight = 0
    this._resizeObserver?.disconnect()
    this._intersectionObserver?.disconnect()
    this._parent?.removeEventListener('mouseenter', this.onEnter)
    this._parent?.removeEventListener('mouseleave', this.onLeave)
    if (!this.noFocus) {
      this._parent?.removeEventListener('focus', this.onEnter, { capture: true })
      this._parent?.removeEventListener('blur', this.onLeave, { capture: true })
    }
    if (this.animation !== null) {
      cancelAnimationFrame(this.animation)
      this.animation = null
    }
    this._parent = null
  }

  private handleResize() {
    if (!this.ctx || !this._initialized) return
    const rect = this.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const width = Math.floor(rect.width)
    const height = Math.floor(rect.height)
    if (width === this._lastWidth && height === this._lastHeight) return
    this._lastWidth = width
    this._lastHeight = height

    const dpr = window.devicePixelRatio || 1
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(dpr, dpr)
    this.createPixels()
    if (this._hovered) this.setIntensity(HOVER_INTENSITY)
    // Pixels created late (zero-size mount) still need their entrance.
    if (this._inView || this._hovered) this.handleAnimation('appear')
  }

  private distanceToBottomLeft(x: number, y: number) {
    const dy = this._lastHeight - y
    return Math.sqrt(x * x + dy * dy)
  }

  private createPixels() {
    if (!this.ctx) return
    this.pixels = []
    // Iterate CSS pixels — the context is already dpr-scaled.
    for (let x = 0; x < this._lastWidth; x += this.gap) {
      for (let y = 0; y < this._lastHeight; y += this.gap) {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)]
        const delay = this.reducedMotion ? 0 : this.distanceToBottomLeft(x, y)
        this.pixels.push(new Pixel(this.canvas, this.ctx, x, y, color, this.speed, delay))
      }
    }
  }

  private setIntensity(factor: number) {
    for (const pixel of this.pixels) pixel.speed = pixel.baseSpeed * factor
  }

  private handleAnimation(name: 'appear' | 'disappear') {
    if (this.animation !== null) cancelAnimationFrame(this.animation)

    const animate = () => {
      this.animation = requestAnimationFrame(animate)
      const timeNow = performance.now()
      const timePassed = timeNow - this.timePrevious
      if (timePassed < this.timeInterval) return
      this.timePrevious = timeNow - (timePassed % this.timeInterval)

      if (!this.ctx) return
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      let allIdle = true
      for (const pixel of this.pixels) {
        pixel[name]()
        if (!pixel.isIdle) allIdle = false
      }
      if (allIdle && this.animation !== null) {
        cancelAnimationFrame(this.animation)
        this.animation = null
      }
    }
    animate()
  }
}

type PixelCanvasIntrinsic = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  'data-gap'?: number | string
  'data-speed'?: number | string
  'data-colors'?: string
  'data-no-focus'?: string
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pixel-canvas': PixelCanvasIntrinsic
    }
  }
}

export interface PixelCanvasProps {
  gap?: number
  speed?: number
  colors?: string[]
  noFocus?: boolean
  style?: React.CSSProperties
}

export function PixelCanvas({ gap, speed, colors, noFocus, style }: PixelCanvasProps) {
  React.useEffect(() => {
    if (!customElements.get('pixel-canvas')) {
      customElements.define('pixel-canvas', PixelCanvasElement)
    }
  }, [])

  return (
    <pixel-canvas
      aria-hidden="true"
      data-gap={gap}
      data-speed={speed}
      data-colors={colors?.join(',')}
      {...(noFocus && { 'data-no-focus': '' })}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        ...style,
      }}
    />
  )
}
