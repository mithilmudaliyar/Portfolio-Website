import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects, TRACK_LABELS, type Track } from '../../lib/projects'
import ProjectCard from './ProjectCard'
import MoreProjects from './MoreProjects'
import './projects.css'

type Filter = Exclude<Track, 'foundations'> | 'all'

// Foundations projects live in the "More projects" shelf below the grid,
// so the grid (and its filters) only deal with the two main tracks.
const mainProjects = projects.filter((p) => p.track !== 'foundations')
const foundationProjects = projects.filter((p) => p.track === 'foundations')

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ai-ml', label: TRACK_LABELS['ai-ml'] },
  { value: 'web', label: TRACK_LABELS.web },
]

export default function Projects() {
  const [filter, setFilter] = useState<Filter>('all')
  const visible =
    filter === 'all' ? mainProjects : mainProjects.filter((p) => p.track === filter)

  return (
    <section id="work" className="section" aria-labelledby="work-heading">
      <span className="section-ghost" aria-hidden="true" data-parallax="0.14">
        02
      </span>
      <div className="container">
        <div className="section-head">
          <span className="section-index" data-reveal>
            02
          </span>
          <h2 id="work-heading" className="section-title" data-split>
            Selected Work
          </h2>
          <span className="head-rule" aria-hidden="true" data-reveal-clip />
        </div>

        <div className="filters" role="group" aria-label="Filter projects by track" data-reveal>
          {FILTERS.map(({ value, label }) => {
            const count =
              value === 'all'
                ? mainProjects.length
                : mainProjects.filter((p) => p.track === value).length
            return (
              <button
                key={value}
                type="button"
                className={`filter ${filter === value ? 'is-active' : ''}`}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
                <sup>{count}</sup>
              </button>
            )
          })}
        </div>

        {/* Announce filter results to assistive tech */}
        <p className="visually-hidden" role="status" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'project' : 'projects'} shown
        </p>

        <motion.ul layout className="project-grid">
          <AnimatePresence mode="popLayout">
            {visible.map((project, i) => (
              <ProjectCard key={project.id} project={project} order={i} />
            ))}
          </AnimatePresence>
        </motion.ul>

        {/* Foundations & fun — collapsed shelf of wide dotted cards */}
        <MoreProjects items={foundationProjects} />
      </div>
    </section>
  )
}
