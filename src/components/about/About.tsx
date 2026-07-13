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
    <section id="about" className="glass-sec" aria-labelledby="about-heading">
      <div className="glass" data-reveal>
        <div className="lab">01 / About</div>
        <h2 id="about-heading" data-words>
          I learn by shipping.
        </h2>
        <p>
          Every project here started as a question I wanted answered. Can a model spot a sick
          plant from one photo? Can streaming feel effortless? Each one turned into working
          software.
        </p>
        <p>
          I work across the stack. In Python I train convolutional networks and build NLP
          chatbots. On the web I turn those ideas into interfaces with TypeScript, React and CSS
          I write by hand. The older Java desktop builds are where I learned the fundamentals,
          things like game loops, state and timers, before I moved them to the browser.
        </p>

        <ul className="skills" aria-label="Core skills">
          {SKILLS.map((skill) => (
            <li key={skill} className="badge">
              {skill}
            </li>
          ))}
        </ul>

        <div className="meta">
          {COORDINATES.map((item) => (
            <div key={item.label}>
              <b>{item.value}</b>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
