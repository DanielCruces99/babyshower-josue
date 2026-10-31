import { useEffect, useState } from 'react'
import { EVENT } from '../config/event.config.js'
import { hostLabel } from '../lib/eventFormat.mjs'
import SceneNav, { useSceneFocus } from './SceneNav.jsx'

const { texts, hosts } = EVENT
const LINE_MS = 4200
const hostById = id => hosts.find(h => h.id === id)

// Escena 2 · Bienvenida personalizada (?nombre=). Las burbujas aparecen en orden y cada una
// le avisa a App quién habla para que su personaje haga la animación de esa línea.
export default function Welcome({ guestName, onLine, onNext }) {
  const heading = useSceneFocus()
  const [step, setStep] = useState(0)
  const lines = texts.welcome

  useEffect(() => {
    onLine(lines[step])
    if (step >= lines.length - 1) return undefined
    const timer = window.setTimeout(() => setStep(s => s + 1), LINE_MS)
    return () => window.clearTimeout(timer)
  }, [step, lines, onLine])

  return (
    <section className="scene-layer welcome" aria-labelledby="welcome-title">
      <h1 id="welcome-title" className="welcome-title" ref={heading} tabIndex={-1}>
        <span>{texts.welcomeFor}</span>
        <strong>{guestName || texts.welcomeGuestDefault}</strong>
      </h1>
      <div className="bubbles" aria-live="polite">
        {lines.slice(0, step + 1).map(line => (
          <p key={line.host} className={`bubble bubble-${line.host}`}>
            <span className="bubble-name">{hostLabel(hostById(line.host))}</span>
            {line.text}
          </p>
        ))}
      </div>
      <SceneNav onNext={onNext} nextAria="Continuar: caminar hacia la orilla" />
    </section>
  )
}
