import { useEffect, useState } from 'react'
import { useMagnetic } from '../../hooks/useMagnetic'

const LINKS = [
  { href: '#about', label: 'About', index: '01' },
  { href: '#work', label: 'Work', index: '02' },
  { href: '#contact', label: 'Contact', index: '03' },
]

/** Which nav item lights up for each observed section. */
const SECTION_TO_LINK: Record<string, string> = {
  about: '#about',
  work: '#work',
  approach: '#work',
  contact: '#contact',
}

function NavLink({ href, label, index, active }: (typeof LINKS)[number] & { active: boolean }) {
  const magnet = useMagnetic<HTMLAnchorElement>()
  return (
    <a
      ref={magnet}
      href={href}
      className={active ? 'is-active' : ''}
      aria-current={active ? 'true' : undefined}
    >
      <sup>{index}</sup>
      {label}
    </a>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the nav item for the section currently in the middle band.
  useEffect(() => {
    const sections = Object.keys(SECTION_TO_LINK)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveLink(SECTION_TO_LINK[entry.target.id])
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sections.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <a className="logo" href="#hero" aria-label="Mithil Mudaliyar, back to top">
          MM<em>·</em>
        </a>
        <nav className="nav" aria-label="Main navigation">
          {LINKS.map((link) => (
            <NavLink key={link.href} {...link} active={activeLink === link.href} />
          ))}
        </nav>
      </div>
    </header>
  )
}
