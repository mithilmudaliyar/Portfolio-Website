import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TRACK_LABELS, type Project } from '../../lib/projects'

interface MoreProjectsProps {
  items: Project[]
}

/**
 * Collapsible "More projects" shelf below the main grid — the foundations
 * projects live here as long full-width ruled cards.
 */
export default function MoreProjects({ items }: MoreProjectsProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="more-projects" data-reveal>
      <button
        type="button"
        className="more-toggle"
        aria-expanded={open}
        aria-controls="more-projects-list"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={`more-toggle-icon ${open ? 'is-open' : ''}`} aria-hidden="true">
          +
        </span>
        <span>{open ? 'Fewer projects' : 'More projects'}</span>
        <span className="more-toggle-meta">
          {TRACK_LABELS.foundations} · {items.length}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id="more-projects-list"
            className="more-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {items.map((project) => (
              <li key={project.id} className="more-card" id={`project-${project.id}`}>
                <div className="more-card-main">
                  <p className="project-track">{project.year}</p>
                  <h3 className="more-card-name">{project.name}</h3>
                  <p className="more-card-tagline">{project.tagline}</p>
                </div>
                <ul className="project-stack" aria-label="Technology stack">
                  {project.stack.map((tech) => (
                    <li key={tech} className="badge">
                      {tech}
                    </li>
                  ))}
                </ul>
                <div className="project-links">
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    GitHub ↗
                  </a>
                  {project.live && (
                    <a href={project.live} target="_blank" rel="noopener noreferrer">
                      Live ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
