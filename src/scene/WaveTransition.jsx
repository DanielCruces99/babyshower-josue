import { useEffect } from 'react'
import { EVENT } from '../config/event.config.js'

export const WAVE_MS = 2200
const REDUCED_WAVE_MS = 300

// Burbujas y destellos dorados (posiciones fijas: mismo resultado en cada visita).
const SPARKLES = [
  [8, 0, 10], [18, 0.15, 6], [27, 0.05, 8], [36, 0.3, 5], [44, 0.1, 12], [52, 0.25, 7], [61, 0.02, 9],
  [69, 0.2, 6], [77, 0.12, 11], [85, 0.28, 7], [92, 0.06, 8], [14, 0.35, 5], [57, 0.4, 6], [81, 0.38, 5],
]

const crest = 'M0 70 Q150 10 300 60 T600 60 T900 60 T1200 60 V120 H0z'

// Escena 5 · Transición de ola: tres capas de ola suben con burbujas doradas, tapan la pantalla
// (ahí se corta la cámara) y se retiran. Con prefers-reduced-motion es un fundido breve.
export default function WaveTransition({ reducedMotion, onCovered, onDone }) {
  const duration = reducedMotion ? REDUCED_WAVE_MS : WAVE_MS
  useEffect(() => {
    const covered = window.setTimeout(onCovered, duration / 2)
    const done = window.setTimeout(onDone, duration)
    return () => { window.clearTimeout(covered); window.clearTimeout(done) }
  }, [duration, onCovered, onDone])

  return (
    <div className={`wave-transition${reducedMotion ? ' is-reduced' : ''}`} style={{ '--wave-ms': `${duration}ms` }} role="status">
      {['back', 'middle'].map(layer => (
        <div key={layer} className={`wave-layer wave-${layer}`} aria-hidden="true">
          <svg className="wave-crest" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d={crest} /></svg>
        </div>
      ))}
      <div className="wave-layer wave-front">
        <svg className="wave-crest" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
          <path d={crest} />
          <path className="wave-foam" d="M0 70 Q150 10 300 60 T600 60 T900 60 T1200 60" />
        </svg>
        <div className="wave-sparkles" aria-hidden="true">
          {SPARKLES.map(([left, delay, size], i) => (
            <span key={i} style={{ left: `${left}%`, width: size, height: size, animationDelay: `${delay * duration}ms` }} />
          ))}
        </div>
        <p>{EVENT.texts.wave}</p>
      </div>
    </div>
  )
}
