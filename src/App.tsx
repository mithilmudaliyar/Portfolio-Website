import { useState } from 'react'
import { MotionConfig } from 'framer-motion'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Intro from './components/intro/Intro'
import Hero from './components/hero/Hero'
import About from './components/about/About'
import Projects from './components/projects/Projects'
import Approach from './components/approach/Approach'
import Marquee from './components/marquee/Marquee'
import Contact from './components/contact/Contact'
import CustomCursor from './components/ui/CustomCursor'
import SoundControl from './components/ui/SoundControl'
import SceneBackground from './components/scene/SceneBackground'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useReveal } from './hooks/useReveal'

const SKILLS_TICKER = [
  'Python',
  'TypeScript',
  'React',
  'Machine Learning',
  'Computer Vision',
  'NLP',
  'Java',
  'Git & GitHub',
]

const CTA_TICKER = ['Full Stack & AI/ML Developer', 'Open to work', 'LLMs + Agents', 'IoT + Embedded']

export default function App() {
  const reduced = useReducedMotion()
  const [introDone, setIntroDone] = useState(false)

  useSmoothScroll(!reduced)
  const scope = useReveal<HTMLDivElement>(!reduced)

  return (
    <MotionConfig reducedMotion="user">
      <div ref={scope}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {!introDone && <Intro onDone={() => setIntroDone(true)} />}
        <SceneBackground ready={introDone} />
        <Header />
        <main id="main">
          <Hero ready={introDone} />
          <About />
          <Marquee items={SKILLS_TICKER} direction={1} />
          <Projects />
          <Approach />
          <Marquee items={CTA_TICKER} direction={-1} variant="accent" />
          <Contact />
        </main>
        <Footer />
        <SoundControl />
        <CustomCursor />
      </div>
    </MotionConfig>
  )
}
