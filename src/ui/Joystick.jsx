import { useEffect, useRef } from 'react'

const clamp = v => Math.max(-1, Math.min(1, v))
const ARROWS = { ArrowLeft: ['x', -1], ArrowRight: ['x', 1], ArrowUp: ['y', -1], ArrowDown: ['y', 1] }

// Joystick virtual + flechas del teclado. Escribe en `value` (un ref { x, y } en -1..1);
// no usa estado de React para no renderizar en cada movimiento.
export default function Joystick({ value, label }) {
  const knob = useRef(null)

  const move = (x, y) => {
    value.current = { x, y }
    if (knob.current) knob.current.style.transform = `translate(${x * 28}px, ${y * 28}px)`
  }

  const onPointer = event => {
    const el = event.currentTarget
    if (event.type === 'pointerdown') el.setPointerCapture(event.pointerId)
    else if (!el.hasPointerCapture(event.pointerId)) return
    const rect = el.getBoundingClientRect()
    move(clamp((event.clientX - rect.left) / (rect.width / 2) - 1), clamp((event.clientY - rect.top) / (rect.height / 2) - 1))
  }

  useEffect(() => {
    const pressed = new Set()
    const update = () => {
      let x = 0
      let y = 0
      for (const key of pressed) { const [axis, dir] = ARROWS[key]; if (axis === 'x') x += dir; else y += dir }
      move(clamp(x), clamp(y))
    }
    const down = e => { if (ARROWS[e.key]) { e.preventDefault(); pressed.add(e.key); update() } }
    const up = e => { if (pressed.delete(e.key)) update() }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      value.current = { x: 0, y: 0 }
    }
  }, [value])

  return (
    <div className="joystick" role="application" aria-label={label}
      onPointerDown={onPointer} onPointerMove={onPointer} onPointerUp={() => move(0, 0)} onPointerCancel={() => move(0, 0)}>
      <span ref={knob} />
    </div>
  )
}
