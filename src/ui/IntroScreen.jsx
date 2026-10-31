import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import { EVENT, isPending } from '../config/event.config.js'

const { texts, baby } = EVENT

// Escena 1 · Carga: progreso real de los modelos, reintento ante error. El diseño final llega en la fase 5.
export default function IntroScreen({ ready, failed, reducedMotion, onDone }) {
  const { progress } = useProgress()
  const done = ready && !failed

  useEffect(() => {
    if (!done) return undefined
    const timer = window.setTimeout(onDone, reducedMotion ? 0 : 900)
    return () => window.clearTimeout(timer)
  }, [done, reducedMotion, onDone])

  const percent = done ? 100 : Math.round(progress)
  return (
    <section className="intro-screen" aria-labelledby="intro-title">
      <div className="intro-sun" aria-hidden="true" />
      <p className="intro-dedication">{texts.loading}</p>
      <h1 id="intro-title">{isPending(baby.name) ? texts.eventKind : baby.name}</h1>
      <p className="intro-tagline">{texts.tagline}</p>
      <p className="intro-status" role="status">{failed ? texts.loadingError : done ? texts.loadingReady : texts.loadingStatus}</p>
      <div className="intro-progress" role="progressbar" aria-label="Carga de la invitación" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <span style={{ width: `${percent}%` }} />
      </div>
      {failed && <button type="button" className="button" onClick={() => window.location.reload()}>{texts.retry}</button>}
    </section>
  )
}
