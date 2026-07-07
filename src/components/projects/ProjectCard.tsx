import { motion } from 'framer-motion'
import { TRACK_LABELS, type Project } from '../../lib/projects'

interface ProjectCardProps {
  project: Project
  order: number
}

/**
 * Catalogue-entry card: oversized serial numeral, serif name, hairline
 * rules. All decoration is typographic — no gradients, no imagery.
 */
export default function ProjectCard({ project, order }: ProjectCardProps) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="project-card"
      id={`project-${project.id}`}
    >
      <span className="project-num" aria-hidden="true">
        {String(order + 1).padStart(2, '0')}
      </span>

      <p className="project-track">
        {TRACK_LABELS[project.track]} · {project.year}
      </p>
      <h3 className="project-name">{project.name}</h3>
      <p className="project-tagline">{project.tagline}</p>

      <p className="project-problem">{project.problem}</p>
      <p className="project-outcome">{project.outcome}</p>

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
    </motion.li>
  )
}
