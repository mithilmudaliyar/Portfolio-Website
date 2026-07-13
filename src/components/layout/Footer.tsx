import { SOCIAL } from '../../lib/projects'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© 2026 Mithil Mudaliyar. Designed and built from scratch.</p>
        <p>
          <a href={SOCIAL.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          {'  ·  '}
          <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
          {'  ·  '}
          <a href={`mailto:${SOCIAL.email}`}>{SOCIAL.email}</a>
        </p>
      </div>
    </footer>
  )
}
