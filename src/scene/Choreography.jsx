import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { clampDelta } from '../lib/renderProfile.mjs'
import { cameraShot, dampingAmount, exploreStep, hostPose, hostsCenter, walkState } from '../motion/beachMotion.mjs'

const angleTo = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

// Aplica la coreografía de beachMotion en cada fotograma: mueve anfitriones y cámara con refs.
// Solo avisa a React cuando cambia la fase de la caminata o al llegar (nunca por fotograma).
// Tras un corte de la ola (flow.cut cambia) todo se coloca de golpe, oculto bajo la ola.
export default function Choreography({ flow, hostRefs, joystick, onWalkPhase, onArrived }) {
  const camera = useThree(s => s.camera)
  const size = useThree(s => s.size)
  const focus = useMemo(() => new Vector3(), [])
  const tmp = useMemo(() => new Vector3(), [])
  const memory = useRef({ layout: null, cut: -1, walkElapsed: 0, walkPhase: null, arrived: false, explore: [0, 0], placed: [] })

  useFrame((_, delta) => {
    const dt = clampDelta(delta)
    const m = memory.current
    const snap = m.cut !== flow.cut
    m.cut = flow.cut
    if (m.layout !== flow.layout) {
      if (flow.layout === 'llegada') Object.assign(m, { walkElapsed: 0, walkPhase: null, arrived: false })
      if (flow.layout !== 'explorar') m.explore = [0, 0]
      m.layout = flow.layout
    }

    if (flow.layout === 'llegada') {
      m.walkElapsed += dt
      const { phase } = walkState(m.walkElapsed)
      if (phase !== m.walkPhase) { m.walkPhase = phase; onWalkPhase(phase) }
      if (phase === 'done' && !m.arrived) { m.arrived = true; onArrived() }
    }
    if (flow.layout === 'explorar') m.explore = exploreStep(m.explore, joystick.current, dt)

    const count = hostRefs.length
    hostRefs.forEach((ref, i) => {
      const group = ref.current
      if (!group) return
      const pose = hostPose(flow.layout, i, count, m.walkElapsed)
      if (snap || !m.placed[i]) {
        group.position.set(...pose.position)
        group.rotation.y = pose.rotationY
        m.placed[i] = true
        return
      }
      // Al caminar la posición sigue exactamente la ruta; en los demás casos se acomoda suave.
      group.position.lerp(tmp.set(...pose.position), flow.layout === 'llegada' ? 1 : dampingAmount(dt, 3))
      group.rotation.y += angleTo(group.rotation.y, pose.rotationY) * dampingAmount(dt, 3.8)
    })

    const portrait = size.height > size.width
    const shot = cameraShot(flow.layout, hostsCenter(flow.layout, count, m.walkElapsed), { portrait, explore: m.explore })
    const amount = snap ? 1 : dampingAmount(dt, flow.layout === 'llegada' ? 3 : 2.2)
    if (snap) focus.set(...shot.target)
    camera.position.lerp(tmp.set(...shot.position), amount)
    focus.lerp(tmp.set(...shot.target), amount)
    camera.lookAt(focus)
    if (Math.abs(camera.fov - shot.fov) > 0.01) {
      camera.fov += (shot.fov - camera.fov) * amount
      camera.updateProjectionMatrix()
    }
  })
  return null
}
