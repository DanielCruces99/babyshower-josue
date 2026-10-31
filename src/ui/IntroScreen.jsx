import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import { EVENT } from '../config/event.config.js'
import { Starfish } from './icons.jsx'

const { texts, baby } = EVENT

// Escena 1 · Carga: el sol se pone con un halo rosa sobre olas animadas en CSS, con el nombre
// de la bebé y el progreso real de los modelos. Si algo falla, ofrece reintentar.
export default function IntroScreen({ ready, failed, reducedMotion, onDone }) {
  const { progress } = useProgress()
  const done = ready && !failed

  useEffect(() => {
    if (!done) return undefined
    const timer = window.setTimeout(onDone, reducedMotion ? 0 : 1100)
    return () => window.clearTimeout(timer)
  }, [done, reducedMotion, onDone])

  const percent = done ? 100 : Math.round(progress)
  return (
    <section className={`intro-screen${done ? ' is-done' : ''}`} aria-labelledby="intro-title">
      <div className="intro-card">
        <p className="intro-dedication">{texts.loading}</p>
        <h1 id="intro-title">{baby.name}</h1>
        <p className="intro-tagline">{texts.tagline}</p>
        <div className="intro-progress" role="progressbar" aria-label="Carga de la invitación" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="intro-status" role="status">{failed ? texts.loadingError : done ? texts.loadingReady : texts.loadingStatus}</p>
        {failed && <button type="button" className="button" onClick={() => window.location.reload()}>{texts.retry}</button>}
      </div>

      <div className="intro-horizon" aria-hidden="true">
        <div className="intro-sun">
          <span className="intro-halo" />
          <Starfish className="intro-monogram" size={44} />
        </div>
        <div className="intro-sea">
          <svg className="intro-wave intro-wave-back" viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0 40 Q180 0 360 40 T720 40 T1080 40 T1440 40 V80 H0z" /></svg>
          <svg className="intro-wave intro-wave-front" viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0 40 Q180 10 360 40 T720 40 T1080 40 T1440 40 V80 H0z" /></svg>
        </div>
      </div>
    </section>
  )
}
