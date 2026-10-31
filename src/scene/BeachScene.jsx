import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { clampDelta } from '../lib/renderProfile.mjs'
import Ocean from './Ocean.jsx'
import Sand from './Sand.jsx'
import Sky from './Sky.jsx'

// Playa procedural: 0 MB de assets. Un solo reloj compartido por todos los shaders.
export default function BeachScene({ settings, mobile, reducedMotion }) {
  const time = useMemo(() => ({ value: 0 }), [])
  useFrame((_, delta) => {
    time.value += clampDelta(delta) * (reducedMotion ? 0.5 : 1)
  })
  return (
    <>
      <Sky />
      <Ocean time={time} segments={settings.oceanSegments} />
      <Sand time={time} mobile={mobile} />
    </>
  )
}
