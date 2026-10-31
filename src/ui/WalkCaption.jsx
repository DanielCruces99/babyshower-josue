import { EVENT } from '../config/event.config.js'
import SceneNav, { useSceneFocus } from './SceneNav.jsx'

const { texts } = EVENT

// Escena 3 · Llegada a la orilla: los anfitriones caminan y la cámara los sigue. Se puede saltar.
export default function WalkCaption({ onBack, onNext }) {
  const heading = useSceneFocus()
  return (
    <section className="scene-layer walk" aria-labelledby="walk-title">
      <p id="walk-title" className="walk-caption" ref={heading} tabIndex={-1} role="status">{texts.walkCaption}</p>
      <SceneNav onBack={onBack} onNext={onNext} nextLabel={texts.nav.skip} backAria="Volver a la bienvenida" nextAria="Saltar la caminata e ir a los detalles" />
    </section>
  )
}
