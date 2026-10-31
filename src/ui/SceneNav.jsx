import { useEffect, useRef } from 'react'
import { EVENT } from '../config/event.config.js'

const { nav } = EVENT.texts

// Lleva el foco del teclado al título de la escena al entrar.
export function useSceneFocus() {
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus({ preventScroll: true }) }, [])
  return ref
}

// Botones Volver / Continuar de cada escena. Si falta un manejador, no se muestra ese botón.
export default function SceneNav({ onBack, onNext, nextLabel = nav.continue, backLabel = nav.back, nextAria, backAria }) {
  return (
    <nav className="scene-nav" aria-label="Navegación de la invitación">
      {onBack && <button type="button" className="button button-ghost" onClick={onBack} aria-label={backAria ?? backLabel}><span aria-hidden="true">←</span> {backLabel}</button>}
      {onNext && <button type="button" className="button" onClick={onNext} aria-label={nextAria ?? nextLabel}>{nextLabel} <span aria-hidden="true">→</span></button>}
    </nav>
  )
}
