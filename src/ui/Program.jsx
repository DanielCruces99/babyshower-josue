import { EVENT } from '../config/event.config.js'
import Icon from './icons.jsx'
import SceneNav, { useSceneFocus } from './SceneNav.jsx'

const { texts, program } = EVENT

// Escena 6 · Programa: tarjetas en el orden de la configuración; al tocar una, los anfitriones
// hacen la animación que esa actividad indica en `actions`.
export default function Program({ selected, onSelect, onBack, onNext }) {
  const heading = useSceneFocus()
  return (
    <section className="scene-layer panel program" aria-labelledby="program-title">
      <p className="kicker">{texts.program.kicker}</p>
      <h1 id="program-title" ref={heading} tabIndex={-1}>{texts.program.title}</h1>
      <p className="hint">{texts.program.hint}</p>
      <ul className="program-list">
        {program.map((item, i) => (
          <li key={item.id}>
            <button type="button" className="program-card" aria-pressed={selected === i} onClick={() => onSelect(i)}>
              <span className="program-icon"><Icon name={item.icon} /></span>
              <span className="program-time">{item.time}</span>
              <strong>{item.title}</strong>
              <span className="program-description">{item.description}</span>
            </button>
          </li>
        ))}
      </ul>
      <SceneNav onBack={onBack} onNext={onNext} backAria="Volver a los detalles" nextAria="Continuar a confirmar asistencia" />
    </section>
  )
}
