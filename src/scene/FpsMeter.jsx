import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

// Solo para medir en desarrollo (?fps=1). Escribe en un nodo del DOM, nunca usa setState por fotograma.
export default function FpsMeter({ target, label }) {
  const acc = useRef({ frames: 0, elapsed: 0 })
  const gl = useThree(s => s.gl)
  useFrame((_, delta) => {
    const a = acc.current
    a.frames++
    a.elapsed += delta
    if (a.elapsed >= 0.5 && target.current) {
      const fps = Math.round(a.frames / a.elapsed)
      target.current.textContent = `${fps} FPS · ${label} · ${gl.info.render.triangles.toLocaleString('es-PE')} triángulos`
      a.frames = 0
      a.elapsed = 0
    }
  })
  return null
}
