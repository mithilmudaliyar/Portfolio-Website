import { motion } from 'framer-motion'
import { TRACK_LABELS, type Project } from '../../lib/projects'
import { useTilt } from '../../hooks/useTilt'

interface ProjectCardProps {
  project: Project
  order: number
}

/**
 * Each project gets a deterministic hue pair inside the site's cool band
 * (teal → violet) so the gradient placeholders feel per-project but never
 * leave the visual language.
 */
function projectHues(id: string): [number, number] {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  const base = 175 + (Math.abs(hash) % 105) // 175–280
  return [base, 175 + (Math.abs(hash >> 7) % 105)]
}

export default function ProjectCard({ project, order }: ProjectCardProps) {
  const tilt = useTilt<HTMLLIElement>()
  const [hueA, hueB] = projectHues(project.id)

  return (
    <motion.li
      ref={tilt}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="project-card"
      id={`project-${project.id}`}
      style={
        {
          '--hue-a': hueA,
          '--hue-b': hueB,
        } as React.CSSProperties
      }
    >
      {/* Animated gradient visual — per-project hues, transform-only drift */}
      <div className="project-visual" aria-hidden="true">
        <span className="project-visual-blob project-visual-blob--a" />
        <span className="project-visual-blob project-visual-blob--b" />
        <span className="project-visual-grid" />
      </div>

      {/* Cursor spotlight overlay */}
      <span className="project-spotlight" aria-hidden="true" />

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
