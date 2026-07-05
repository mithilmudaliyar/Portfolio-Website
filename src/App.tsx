import { useState } from 'react'
import { MotionConfig } from 'framer-motion'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Intro from './components/intro/Intro'
import Hero from './components/hero/Hero'
import About from './components/about/About'
import Projects from './components/projects/Projects'
import Lab from './components/lab/Lab'
import CaseStudies from './components/case-studies/CaseStudies'
import Contact from './components/contact/Contact'
import CustomCursor from './components/ui/CustomCursor'
import ScrollProgressBar from './components/ui/ScrollProgressBar'
import SoundControl from './components/ui/SoundControl'
import SceneBackground from './components/scene/SceneBackground'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useReveal } from './hooks/useReveal'

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
        <ScrollProgressBar />
        <Header />
        <main id="main">
          <Hero ready={introDone} />
          <About />
          <Projects />
          <Lab />
          <CaseStudies />
          <Contact />
        </main>
        <Footer />
        <SoundControl />
        <CustomCursor />
      </div>
    </MotionConfig>
  )
}
