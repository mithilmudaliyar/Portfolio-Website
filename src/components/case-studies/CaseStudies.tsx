import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './case-studies.css'

gsap.registerPlugin(ScrollTrigger)

interface Study {
  id: string
  num: string
  title: string
  stack: string[]
  problem: string
  approach: string
  process: string[]
  outcome: string
  challenge: string
}

const STUDIES: Study[] = [
  {
    id: 'health-care-chatbot',
    num: '01',
    title: 'Health-Care Chatbot',
    stack: ['Python', 'NLP', 'Intent Classification'],
    problem:
      'When something feels wrong, most people turn to a search engine and drown in contradictory results. I wanted a guided conversation instead: describe your symptoms, get a likely condition and a sensible next step.',
    approach:
      'A Python chatbot built around intent classification. User input is normalized and matched against a curated symptom-to-condition knowledge base, with remedy suggestions attached to each condition.',
    process: [
      'Collected and normalized common symptom phrasings to build the training vocabulary.',
      'Built a preprocessing pipeline — tokenization, lowercasing, stop-word handling.',
      'Iterated on matching accuracy against a held-out set of symptom descriptions.',
      'Added guided follow-up questions when the confidence on a match was low.',
    ],
    outcome:
      'A working chatbot that narrows free-text symptoms to a likely condition and suggests remedies — with a clear disclaimer that it assists, not replaces, a doctor.',
    challenge:
      'Free-text symptom input is messy — "my head is killing me" and "severe headache" must land in the same bucket. Normalizing input and constraining the conversation to guided questions cut misclassifications dramatically.',
  },
  {
    id: 'plant-disease-detection',
    num: '02',
    title: 'Plant Disease Detection',
    stack: ['Python', 'CNN', 'Computer Vision', 'Jupyter'],
    problem:
      'Crop diseases spread quietly. By the time damage is obvious, treatment windows have often closed. A photo of a leaf contains enough signal to catch it earlier.',
    approach:
      'A convolutional neural network trained on labeled leaf images, classifying disease from a single photo. Heavy augmentation compensates for a modest dataset.',
    process: [
      'Prepared and cleaned the leaf-image dataset, split by disease class.',
      'Handled class imbalance with augmentation — flips, rotations, brightness shifts.',
      'Trained and validated the CNN, tuning against the confusion matrix per class.',
      'Tested on unseen images to confirm the model generalizes past its training set.',
    ],
    outcome:
      'A classifier that identifies plant diseases from one leaf photo — the kind of model that could sit behind a farmer-facing app.',
    challenge:
      'Early versions memorized lush training backgrounds instead of lesions. Aggressive augmentation plus regularization forced the network to learn the disease patterns themselves — validation accuracy followed.',
  },
  {
    id: 'musify',
    num: '03',
    title: 'Musify',
    stack: ['JavaScript', 'HTML5 Audio', 'CSS'],
    problem:
      'Streaming platforms interrupt the one thing they exist for: listening. Ads between tracks, features behind paywalls. I wanted play-and-listen, nothing else.',
    approach:
      'A vanilla-JavaScript streaming web app built on the HTML5 Audio API — search, playlists and a persistent player, no framework, no accounts, no ads.',
    process: [
      'Designed the player as a small state machine — play, pause, seek, queue.',
      'Built search and library views that render dynamically from track data.',
      'Kept one persistent audio element so playback survives every UI change.',
      'Polished the responsive layout so the player works from phone to desktop.',
    ],
    outcome:
      'A free, ad-free music streaming app where playback simply never stops — the interface re-renders around the music, not over it.',
    challenge:
      'Keeping audio uninterrupted while the UI changes was the hard part. The fix: a single persistent audio element with player state held outside the render path, so switching views never touches the stream.',
  },
]

/**
 * The signature pinned/scrubbed section. The pin itself is the CSS-sticky
 * study aside (native, no layout shift); ScrollTrigger adds the scrubbed
 * layer on top: a progress rail that fills as you travel the section and
 * study numbers that brighten as their study enters. Scrub only — no
 * snapping, scroll is never trapped. Desktop-only, skipped under
 * prefers-reduced-motion.
 */
export default function CaseStudies() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !sectionRef.current) return

    const mm = gsap.matchMedia(sectionRef)
    mm.add('(min-width: 900px)', () => {
      const studies = sectionRef.current!.querySelector('.studies')
      if (!studies) return

      gsap.fromTo(
        '.studies-rail-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: studies,
            start: 'top 60%',
            end: 'bottom 80%',
            scrub: 0.6,
          },
        },
      )

      gsap.utils.toArray<HTMLElement>('.study').forEach((study) => {
        const num = study.querySelector('.study-num')
        if (!num) return
        gsap.fromTo(
          num,
          { autoAlpha: 0.25 },
          {
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: { trigger: study, start: 'top 75%', end: 'top 30%', scrub: 0.6 },
          },
        )
      })
    })

    return () => mm.revert()
  }, [reduced])

  return (
    <section
      id="case-studies"
      ref={sectionRef}
      className="section"
      aria-labelledby="case-studies-heading"
    >
      <span className="section-ghost" aria-hidden="true" data-parallax="0.12">
        03
      </span>
      <div className="container">
        <div className="section-head">
          <span className="section-index" data-reveal>
            03
          </span>
          <h2 id="case-studies-heading" className="section-title" data-split>
            Case Studies
          </h2>
          <span className="head-rule" aria-hidden="true" data-reveal-clip />
        </div>

        <div className="studies">
          <span className="studies-rail" aria-hidden="true">
            <span className="studies-rail-fill" />
          </span>
          {STUDIES.map((study) => (
            <article key={study.id} className="study" aria-labelledby={`study-${study.id}`}>
              <aside className="study-aside" data-reveal>
                <span className="study-num" aria-hidden="true">
                  {study.num}
                </span>
                <h3 id={`study-${study.id}`} className="study-title">
                  {study.title}
                </h3>
                <ul className="study-stack" aria-label="Technology stack">
                  {study.stack.map((tech) => (
                    <li key={tech} className="badge">
                      {tech}
                    </li>
                  ))}
                </ul>
              </aside>

              <div className="study-body">
                <div className="study-block" data-reveal>
                  <h4>Problem</h4>
                  <p>{study.problem}</p>
                </div>
                <div className="study-block" data-reveal>
                  <h4>Approach</h4>
                  <p>{study.approach}</p>
                </div>
                <div className="study-block" data-reveal>
                  <h4>Process</h4>
                  <ol className="study-process">
                    {study.process.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="study-block" data-reveal>
                  <h4>Outcome</h4>
                  <p>{study.outcome}</p>
                </div>
                <p className="study-challenge" data-reveal>
                  <strong>Challenge solved —</strong> {study.challenge}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
