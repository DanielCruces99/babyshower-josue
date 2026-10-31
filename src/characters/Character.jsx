import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { AnimationMixer, LoopOnce, LoopRepeat, Vector3 } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { PALETTE } from '../config/palette.mjs'
import { clampDelta } from '../lib/renderProfile.mjs'
import { HOLDING, HOST_MODELS, IDLE, LOOPING, modelPath } from './characterAnimations.mjs'
import { blendWeights, prepareCharacterClips, resolveClip } from './characterMotion.mjs'

const url = model => import.meta.env.BASE_URL + modelPath(model)

// Tiñe los materiales del modelo provisional (Y Bot: «Body» y «Joints») con la paleta.
function applyTint(scene, tint) {
  scene.traverse(obj => {
    if (!obj.isMesh) return
    obj.frustumCulled = false // el esqueleto se mueve fuera de la caja original
    if (!tint) return
    obj.material = obj.material.clone()
    const key = /joint/i.test(obj.material.name + obj.name) ? tint.joints : tint.body
    if (PALETTE[key]) obj.material.color.set(PALETTE[key])
  })
}

const shadowVertex = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const shadowFragment = 'varying vec2 vUv; void main() { float r = length((vUv - 0.5) * 2.0); float a = 0.3 * pow(max(0.0, 1.0 - r * r), 2.0); gl_FragColor = vec4(0.149, 0.275, 0.325, a); }'

export default function Character({ host, actionName = IDLE, position, rotationY = 0 }) {
  const { model, tint } = HOST_MODELS[host]
  const source = useGLTF(url(model))
  const group = useRef()

  const rig = useMemo(() => {
    const scene = clone(source.scene)
    applyTint(scene, tint)
    scene.updateMatrixWorld(true)
    const hips = scene.getObjectByName('mixamorigHips')
    const hipsScale = hips?.parent ? hips.parent.getWorldScale(new Vector3()).x : 1
    const { clips, stride } = prepareCharacterClips(source.animations, model, hipsScale)
    const mixer = new AnimationMixer(scene)
    const actions = clips.map(clip => mixer.clipAction(clip))
    const idle = resolveClip(clips, IDLE)
    return { scene, mixer, actions, clips, stride, idle, selected: idle, weights: clips.map((_, i) => (i === idle ? 1 : 0)) }
  }, [source, model, tint])

  useEffect(() => {
    rig.actions[rig.idle].play()
    rig.selected = resolveClip(rig.clips, actionName)
    const action = rig.actions[rig.selected]
    const name = action.getClip().name
    if (rig.weights[rig.selected] < 0.01 || action.time >= action.getClip().duration) action.reset()
    action.setLoop(LOOPING.test(name) ? LoopRepeat : LoopOnce, Infinity)
    action.clampWhenFinished = true
    action.timeScale = name === IDLE ? 0.8 : 1
    action.play()
  }, [actionName, rig])

  useEffect(() => () => {
    rig.mixer.stopAllAction()
    rig.mixer.uncacheRoot(rig.scene)
  }, [rig])

  useFrame((_, delta) => {
    const dt = clampDelta(delta)
    const active = rig.actions[rig.selected]
    const clip = active.getClip()
    // Los gestos de una sola vez vuelven a Idle al terminar (las poses se quedan).
    if (active.loop === LoopOnce && active.time >= clip.duration && !HOLDING.test(clip.name)) rig.selected = rig.idle
    rig.weights = blendWeights(rig.weights, rig.selected, dt)
    rig.actions.forEach((action, i) => action.setEffectiveWeight(rig.weights[i]))
    rig.mixer.update(dt)
  })

  return (
    <group ref={group} position={position} rotation-y={rotationY}>
      <primitive object={rig.scene} />
      {/* Sombra de contacto falsa: ancla los pies sin mapas de sombra. */}
      <mesh position={[0, 0.02, 0.05]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[0.9, 0.6]} />
        <shaderMaterial transparent depthWrite={false} vertexShader={shadowVertex} fragmentShader={shadowFragment} />
      </mesh>
    </group>
  )
}

export const preloadCharacters = () => {
  for (const model of new Set(Object.values(HOST_MODELS).map(h => h.model))) useGLTF.preload(url(model))
}
