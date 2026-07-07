import LocationGlobe from './LocationGlobe'
import './about.css'

const SKILLS = [
  'Python',
  'TypeScript / JavaScript',
  'React',
  'Machine Learning',
  'Computer Vision',
  'NLP',
  'Java',
  'HTML / CSS / SCSS',
  'Git & GitHub',
]

const COORDINATES = [
  { label: 'Public repos', value: '16' },
  { label: 'Focus', value: 'ML × Web' },
  { label: 'Status', value: 'Open to work' },
]

export default function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-heading">
      <span className="section-ghost" aria-hidden="true" data-parallax="0.18">
        01
      </span>
      <div className="container about-grid">
        <div className="about-aside">
          <div className="about-head">
            <span className="section-index" data-reveal>
              01
            </span>
            <h2 id="about-heading" className="section-title" data-split>
              About
            </h2>
            <span className="head-rule" aria-hidden="true" data-reveal-clip />
          </div>
          <LocationGlobe />
        </div>

        <div className="about-body">
          <p className="about-lede" data-reveal>
            I learn by shipping. Every project on this site started as a question —{' '}
            <em>can a model spot a sick plant? can streaming feel frictionless?</em> — and
            ended as working software.
          </p>
          <p data-reveal>
            I work across the stack: training convolutional networks and building NLP
            chatbots in Python, then turning ideas into interfaces with TypeScript, React
            and hand-written CSS. The Java desktop builds are where I sharpened the
            fundamentals — game loops, state, timers — before moving them to the web.
          </p>
          <p data-reveal>
            Right now I'm deepening the AI side of my work — LLMs and agentic workflows,
            prompt and context engineering, retrieval-augmented pipelines — while keeping
            every interface I ship fast, accessible and worth looking at.
          </p>
          <p data-reveal>
            I also have a soft spot for IoT and embedded systems — there's something
            satisfying about software that has to answer to real hardware. It's not where
            my day-to-day work lives yet, but it's the kind of project I'd jump at given
            the chance.
          </p>

          <ul className="skills" aria-label="Core skills" data-reveal>
            {SKILLS.map((skill) => (
              <li key={skill} className="badge">
                {skill}
              </li>
            ))}
          </ul>

          <dl className="coordinates" data-reveal>
            {COORDINATES.map((item) => (
              <div key={item.label} className="coordinate">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
