import { useEffect } from 'react'
import { EVENT } from '../config/event.config.js'

export const WAVE_MS = 2000
const REDUCED_WAVE_MS = 300

// Escena 5 · Transición de ola: una ola sube, tapa la pantalla (ahí se corta la cámara) y se retira.
// Con prefers-reduced-motion es un fundido breve.
export default function WaveTransition({ reducedMotion, onCovered, onDone }) {
  const duration = reducedMotion ? REDUCED_WAVE_MS : WAVE_MS
  useEffect(() => {
    const covered = window.setTimeout(onCovered, duration / 2)
    const done = window.setTimeout(onDone, duration)
    return () => { window.clearTimeout(covered); window.clearTimeout(done) }
  }, [duration, onCovered, onDone])

  return (
    <div className={`wave-transition${reducedMotion ? ' is-reduced' : ''}`} style={{ '--wave-ms': `${duration}ms` }} role="status">
      <div className="wave-body">
        <svg className="wave-crest" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 70 Q150 10 300 60 T600 60 T900 60 T1200 60 V120 H0z" />
          <path className="wave-foam" d="M0 70 Q150 10 300 60 T600 60 T900 60 T1200 60" />
        </svg>
        <p>{EVENT.texts.wave}</p>
      </div>
    </div>
  )
}
