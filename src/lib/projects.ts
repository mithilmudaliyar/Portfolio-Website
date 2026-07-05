export type Track = 'ai-ml' | 'web' | 'foundations'

export interface Project {
  id: string
  name: string
  track: Track
  year: string
  tagline: string
  problem: string
  outcome: string
  stack: string[]
  github: string
  live?: string
}

export const TRACK_LABELS: Record<Track, string> = {
  'ai-ml': 'AI / Machine Learning',
  web: 'Full-Stack / Web',
  foundations: 'Foundations & Fun',
}

const GH = 'https://github.com/mithilmudaliyar'

export const projects: Project[] = [
  {
    id: 'health-care-chatbot',
    name: 'Health-Care Chatbot',
    track: 'ai-ml',
    year: '2023',
    tagline: 'First-line medical guidance, on demand.',
    problem:
      'Reliable first-line health information is hard to reach — search results overwhelm and appointments take days.',
    outcome:
      'A Python chatbot that maps described symptoms to likely conditions and suggests remedies or sensible next steps.',
    stack: ['Python', 'NLP', 'Intent Classification'],
    github: `${GH}/Health-Care-Chatbot`,
  },
  {
    id: 'plant-disease-detection',
    name: 'Plant Disease Detection',
    track: 'ai-ml',
    year: '2023',
    tagline: 'Computer vision for healthier crops.',
    problem: 'Crop diseases are easy to miss until it is too late for treatment.',
    outcome:
      'A CNN classifier that identifies plant diseases from a single leaf photo, trained with heavy augmentation.',
    stack: ['Python', 'CNN', 'Computer Vision', 'Jupyter'],
    github: `${GH}/Plant-Disease-Detection`,
  },
  {
    id: 'fire-smoke-detection',
    name: 'Fire & Smoke Detection',
    track: 'ai-ml',
    year: '2025',
    tagline: 'Vision models for life-safety testing.',
    problem: 'Manual review of fire and smoke life-test footage is slow and error-prone.',
    outcome:
      'A Gemini-assisted vision pipeline that flags fire and smoke events in test imagery automatically.',
    stack: ['Python', 'Gemini API', 'Jupyter'],
    github: `${GH}/fire-smoke-life-test-gemini`,
  },
  {
    id: 'musify',
    name: 'Musify',
    track: 'web',
    year: '2023',
    tagline: 'Ad-free streaming, zero friction.',
    problem: 'Music streaming buries listening behind ads, upsells and paywalls.',
    outcome:
      'A free music-streaming web app with search, playlists and uninterrupted playback — no ads, no accounts.',
    stack: ['JavaScript', 'HTML5 Audio', 'CSS'],
    github: `${GH}/Musify_Music_Streaming_App`,
  },
  {
    id: 'cityscout',
    name: 'CityScout — Smart City',
    track: 'web',
    year: '2023',
    tagline: 'A city guide that actually knows the city.',
    problem: 'Finding trustworthy local places means juggling maps, blogs and review sites.',
    outcome:
      'A city-navigator web app surfacing places, details and directions in a single view.',
    stack: ['JavaScript', 'SCSS', 'Maps'],
    github: `${GH}/Smart_City`,
  },
  {
    id: 'fashionstore',
    name: 'EComm FashionStore',
    track: 'web',
    year: '2023',
    tagline: 'E-commerce front-end, pixel by pixel.',
    problem: 'Fashion e-commerce lives or dies on presentation and browsing flow.',
    outcome:
      'A hand-built storefront front-end — product grids, detail views and cart flow in vanilla HTML/CSS/JS.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    github: `${GH}/EComm_FashionStore_Website`,
  },
  {
    id: 'plant-engineering-people',
    name: 'Plant · Engineering · People',
    track: 'web',
    year: '2026',
    tagline: 'Latest build — TypeScript, end to end.',
    problem: 'Plant-engineering workflows scatter across tools and teams.',
    outcome: 'An in-progress TypeScript application connecting plant engineering work and people.',
    stack: ['TypeScript', 'React'],
    github: `${GH}/Plant-Engineering-People`,
  },
  {
    id: 'snake-game',
    name: 'Snake Game',
    track: 'foundations',
    year: '2023',
    tagline: 'The classic, rebuilt in Java.',
    problem: 'Game loops, collision and state — fundamentals worth doing by hand.',
    outcome: 'A playable Swing-based snake game with score tracking.',
    stack: ['Java', 'Swing'],
    github: `${GH}/Snake_Game`,
  },
  {
    id: 'digital-clock',
    name: 'Digital Clock',
    track: 'foundations',
    year: '2023',
    tagline: 'Time, day and date — live in Java.',
    problem: 'A small desktop utility to practice Java UI and timers.',
    outcome: 'A desktop clock showing time, day and date, updating in real time.',
    stack: ['Java'],
    github: `${GH}/Digital_Clock`,
  },
  {
    id: 'random-color-generator',
    name: 'Random Color Generator',
    track: 'foundations',
    year: '2023',
    tagline: 'A new palette on every click.',
    problem: 'Pick a color, get its hex — instantly.',
    outcome: 'A one-click random color generator with copyable hex codes.',
    stack: ['JavaScript', 'CSS'],
    github: `${GH}/Random_Color_Generator`,
  },
  {
    id: 'doomsday-clock',
    name: 'DoomsDay Clock',
    track: 'foundations',
    year: '2023',
    tagline: 'A countdown with attitude.',
    problem: 'Date math and live countdown rendering in the browser.',
    outcome: 'A themed countdown timer built with vanilla HTML, CSS and JavaScript.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    github: `${GH}/DoomsDay_Clock`,
  },
]

export const SOCIAL = {
  github: GH,
  linkedin: 'https://www.linkedin.com/in/mithil-mudaliyar/',
  email: 'mithilmudaliyar@gmail.com',
  resume: '/resume.pdf',
}
