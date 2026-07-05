# Mithil Mudaliyar — Portfolio

Award-caliber single-page portfolio: dark cinematic "Digital Observatory" design with an
interactive 3D project constellation, scroll choreography and strict performance and
accessibility budgets.

## Stack

- **React 19 + Vite + TypeScript**
- **Three.js + React Three Fiber + drei** — 3D constellation hero (one custom GLSL shader)
- **GSAP ScrollTrigger + Lenis** — smooth scroll and section reveals
- **Framer Motion** — filterable project grid transitions
- CSS custom-property design tokens, component-per-feature file structure

## Performance & accessibility

- WebGL initializes only after the page is interactive (LCP protected); text renders first
- `devicePixelRatio` capped at 1.5; render loop fully pauses off-screen / hidden tab
- Pure-CSS starfield fallback when WebGL is unavailable
- `prefers-reduced-motion` honored everywhere; intro is skippable
- Semantic HTML, keyboard navigable, WCAG AA contrast

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build (dist/)
npm run preview  # serve the production build
```

## Deploy

Static output in `dist/` — deploys directly to Vercel (zero config), Netlify or GitHub Pages.

## Notes

- Replace `public/resume.pdf` with the real resume.
- Project data lives in `src/lib/projects.ts`.
