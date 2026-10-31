import SceneNav, { useSceneFocus } from './SceneNav.jsx'

// Escenas 7 y 8 (asistencia y regalos) mientras se conectan con Apps Script en la fase 6.
export default function Placeholder({ id, title, text, onBack, onNext, backAria, nextAria }) {
  const heading = useSceneFocus()
  return (
    <section className="scene-layer panel" aria-labelledby={`${id}-title`}>
      <h1 id={`${id}-title`} ref={heading} tabIndex={-1}>{title}</h1>
      <p>{text}</p>
      <SceneNav onBack={onBack} onNext={onNext} backAria={backAria} nextAria={nextAria} />
    </section>
  )
}
