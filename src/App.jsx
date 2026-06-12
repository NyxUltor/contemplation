import { useEffect, useState } from 'react'
import Scene from './scene/Scene'
import './App.css'

function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [cursor, setCursor] = useState({ x: 0, y: 0, active: false })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      setScrollProgress(Math.max(0, Math.min(1, progress)))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onPointerMove = (event) => {
      const interactive = Boolean(event.target.closest('a, button, [data-interactive="true"]'))
      setCursor({ x: event.clientX, y: event.clientY, active: interactive })
    }

    const onPointerLeave = () => {
      setCursor((prev) => ({ ...prev, active: false }))
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerleave', onPointerLeave)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 850)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="app-root">
      <div className="scene-layer">
        <Scene scrollProgress={scrollProgress} />
      </div>

      <div className="scroll-space" aria-hidden="true" />

      <div className="scroll-line" style={{ height: `${scrollProgress * 100}%` }} aria-hidden="true" />

      <div
        className={`feather-cursor ${cursor.active ? 'is-active' : ''}`}
        style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
          <path d="M27.5 3.5c-7.1 1.2-14 6-17.7 12.5C7.2 20.2 6 24.7 5.8 29.2c4.5-.2 9-1.4 13.2-4 6.5-3.7 11.3-10.6 12.5-17.7-.7-.6-1.9-1.6-4-4zM11 23.4l7.8-7.8m-10.4 10.4 5.6-5.6" />
        </svg>
        <span className="cursor-pulse" />
      </div>

      <div className={`loading-overlay ${loaded ? 'is-hidden' : ''}`} role="status" aria-live="polite">
        Summoning the scene...
      </div>
    </div>
  )
}

export default App