import { Suspense, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { EVENT } from '../config/event.config.js'
import { PALETTE } from '../config/palette.mjs'
import Character from '../characters/Character.jsx'
import { clampDelta } from '../lib/renderProfile.mjs'
import { WALK } from '../motion/beachMotion.mjs'
import { SUN_DIRECTION } from './beachShape.mjs'
import Choreography from './Choreography.jsx'
import Ocean from './Ocean.jsx'
import Sand from './Sand.jsx'
import Sky from './Sky.jsx'

const SUN_LIGHT_POSITION = SUN_DIRECTION.map(c => c * 20)

// Dentro del mismo Suspense: su efecto solo corre cuando todos los personajes ya cargaron.
function CharactersReady({ onReady }) {
  useEffect(() => { onReady() }, [onReady])
  return null
}

// Playa procedural (0 MB de assets) + anfitriones. Un solo reloj compartido por todos los shaders.
export default function BeachScene({ settings, mobile, reducedMotion, flow, actions, hostRefs, joystick, onWalkPhase, onArrived, onCharactersReady }) {
  const time = useMemo(() => ({ value: 0 }), [])
  useFrame((_, delta) => {
    time.value += clampDelta(delta) * (reducedMotion ? 0.5 : 1)
  })
  return (
    <>
      <Sky />
      <Ocean time={time} segments={settings.oceanSegments} />
      <Sand time={time} mobile={mobile} />

      {/* Luz del atardecer para los personajes: cielo rosado, contraluz dorado y relleno frontal suave. */}
      <hemisphereLight args={[PALETTE.rosaPalo, PALETTE.arena, 1.6]} />
      <directionalLight position={SUN_LIGHT_POSITION} color={PALETTE.dorado} intensity={2.2} />
      <directionalLight position={[0, 4, 12]} color={PALETTE.blancoEspuma} intensity={1.1} />

      <Suspense fallback={null}>
        {EVENT.hosts.map((host, i) => (
          <Character key={host.id} host={host.id} actionName={actions[host.id]} groupRef={hostRefs[i]} walkSpeed={WALK.speed} />
        ))}
        <CharactersReady onReady={onCharactersReady} />
      </Suspense>
      <Choreography flow={flow} hostRefs={hostRefs} joystick={joystick} onWalkPhase={onWalkPhase} onArrived={onArrived} />
    </>
  )
}
