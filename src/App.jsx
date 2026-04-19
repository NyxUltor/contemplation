import { useEffect, useState } from 'react'
import HeroScene from './HeroScene'
import './App.css'

const projects = [
  {
    title: 'Nocturne Atelier',
    detail: 'Art direction and frontend system for a cinematic fashion archive.',
    tag: 'Direction + Frontend',
  },
  {
    title: 'Obsidian Notes',
    detail: 'Product interface for a private writing ritual with ambient controls.',
    tag: 'Product Design',
  },
  {
    title: 'Funeral Bloom',
    detail: 'Brand + site for floral storytelling with atmospheric interactions.',
    tag: 'Brand + Web',
  },
  {
    title: 'Epitaph Systems',
    detail: 'Dark-mode dashboard language and visual documentation framework.',
    tag: 'UI Systems',
  },
]

const services = [
  {
    icon: '✦',
    title: 'Visual Direction',
    copy: 'Moody concept development for products and brands.',
  },
  {
    icon: '☽',
    title: 'Frontend Craft',
    copy: 'Responsive interfaces with layered motion and atmosphere.',
  },
  {
    icon: '🜁',
    title: '3D + Motion',
    copy: 'Three.js scenes and scroll choreography for narrative landing pages.',
  },
]

function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [cursor, setCursor] = useState({ x: 0, y: 0, active: false })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const nextProgress = scrollable > 0 ? window.scrollY / scrollable : 0
      setScrollProgress(Math.max(0, Math.min(1, nextProgress)))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onPointerMove = (event) => {
      const interactive = Boolean(event.target.closest('a, button, .glass-card'))
      setCursor({ x: event.clientX, y: event.clientY, active: interactive })
    }

    const onLeave = () => {
      setCursor((prev) => ({ ...prev, active: false }))
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.2 },
    )

    const elements = document.querySelectorAll('.reveal')
    elements.forEach((element) => observer.observe(element))

    return () => {
      elements.forEach((element) => observer.unobserve(element))
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 850)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className={`page ${loaded ? 'is-loaded' : ''}`}>
      <div className="bg-blob bg-blob-one" aria-hidden="true" />
      <div className="bg-blob bg-blob-two" aria-hidden="true" />
      <div className="bg-blob bg-blob-three" aria-hidden="true" />
      <div className="scroll-indicator" style={{ transform: `scaleY(${scrollProgress})` }} />
      <div
        className={`feather-cursor ${cursor.active ? 'is-active' : ''}`}
        style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
      />

      <main>
        <section id="hero" className="hero-section">
          <HeroScene scrollProgress={scrollProgress} />
          <div className="hero-overlay glass-card reveal is-visible">
            <p className="availability" aria-live="polite">
              Available for work
            </p>
            <h1>Nyx Ultor</h1>
            <p className="hero-copy">
              Building sepulchral digital experiences with crimson detail, glass layers, and
              cinematic motion.
            </p>
          </div>
        </section>

        <section id="about" className="content-section reveal glass-card">
          <h2>About</h2>
          <p>
            I shape haunted, deliberate interfaces where typography, atmosphere, and interaction
            feel authored rather than assembled. Every decision balances restraint with spectacle.
          </p>
        </section>

        <section id="work" className="content-section reveal">
          <h2>Work</h2>
          <div className="work-grid">
            {projects.map((project, index) => (
              <article
                className={`glass-card work-card ${index % 3 === 0 ? 'work-card-large' : ''}`}
                key={project.title}
              >
                <p className="card-tag">{project.tag}</p>
                <h3>{project.title}</h3>
                <p>{project.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="services" className="content-section reveal">
          <h2>Services</h2>
          <div className="services-row">
            {services.map((service) => (
              <article className="glass-card service-card" key={service.title}>
                <span className="service-icon" aria-hidden="true">
                  {service.icon}
                </span>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="hire" className="content-section reveal glass-card hire-section">
          <p>Do you need a website that feels impossible to ignore?</p>
          <a href="https://github.com/NyxUltor" target="_blank" rel="noreferrer">
            Visit GitHub
          </a>
        </section>
      </main>

      <footer className="reveal">
        <a href="#hero">Hero</a>
        <a href="#about">About</a>
        <a href="#work">Work</a>
        <a href="#services">Services</a>
        <a href="#hire">Hire</a>
      </footer>

      {!loaded && (
        <div className="loading-layer" role="status" aria-live="polite">
          Summoning the scene...
        </div>
      )}
    </div>
  )
}

export default App
