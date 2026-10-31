import { Quaternion } from 'three'
import { CHARACTER_ANIMATIONS, IDLE, LOOPING, MOVES_LEGS, WALK } from './characterAnimations.mjs'

const LOWER_BODY = /Hips|UpLeg|Leg|Foot|Toe/
const HIPS_POSITION = /Hips\.position$/
const MIN_DURATION = 0.5 // las poses de Mixamo traen un solo fotograma
const sample = (track, time = 0) => Array.from(track.createInterpolant().evaluate(time))

// Eje vertical de la cadera: el componente con mayor valor medio (la altura de la cadera).
export function verticalAxis(hipsTrack) {
  const sums = [0, 0, 0]
  hipsTrack.values.forEach((v, i) => { sums[i % 3] += Math.abs(v) })
  return sums.indexOf(Math.max(...sums))
}

// Prepara los clips: trabaja sobre clones (nunca sobre la caché de useGLTF), fija las piernas
// a la pose de Idle en los clips de brazos, quita el desplazamiento horizontal de la caminata
// (la posición la maneja el código), mide la zancada y suaviza la unión de los bucles.
// hipsScale: escala mundial del padre de la cadera, para pasar la zancada a metros.
export function prepareCharacterClips(animations, model, hipsScale = 1) {
  const wanted = CHARACTER_ANIMATIONS[model] ?? animations.map(c => c.name)
  const idle = animations.find(c => c.name === IDLE) ?? animations[0]
  const idleTracks = new Map(idle.tracks.map(t => [t.name, t]))
  const idleHips = idle.tracks.find(t => HIPS_POSITION.test(t.name))
  const up = idleHips ? verticalAxis(idleHips) : 1
  const ground = [0, 1, 2].filter(k => k !== up)
  const anchor = idleHips ? sample(idleHips) : null
  const q = new Quaternion()
  const target = new Quaternion()
  let stride = 0

  const clips = animations.filter(c => wanted.includes(c.name)).map(c => c.clone())
  for (const clip of clips) {
    if (clip.name === idle.name) continue // Idle se usa tal cual
    if (clip.duration < MIN_DURATION) clip.duration = MIN_DURATION
    const legs = MOVES_LEGS.test(clip.name)
    for (const track of clip.tracks) {
      const size = track.getValueSize()
      if (!legs && LOWER_BODY.test(track.name)) {
        const base = sample(idleTracks.get(track.name) || track)
        for (let i = 0; i < track.values.length; i += size) track.values.set(base, i)
      } else if (HIPS_POSITION.test(track.name) && anchor) {
        const first = sample(track)
        const last = sample(track, clip.duration)
        if (clip.name === WALK) stride = Math.hypot(...ground.map(k => last[k] - first[k])) * hipsScale
        for (let i = 0; i < track.times.length; i++) {
          const t = track.times[i] / clip.duration
          // Solo se quita el avance sobre el suelo; el sube y baja del paso se conserva.
          for (const k of ground) track.values[i * 3 + k] += anchor[k] - first[k] - (last[k] - first[k]) * t
        }
      }
      if (LOOPING.test(clip.name)) {
        const first = sample(track)
        const seam = Math.min(0.18, clip.duration * 0.1)
        for (let i = 0; i < track.times.length; i++) {
          const t = Math.max(0, (track.times[i] - clip.duration + seam) / seam)
          const amount = t * t * (3 - 2 * t)
          if (!amount) continue
          if (track.name.endsWith('.quaternion')) q.fromArray(track.values, i * size).slerp(target.fromArray(first), amount).toArray(track.values, i * size)
          else for (let k = 0; k < size; k++) track.values[i * size + k] += (first[k] - track.values[i * size + k]) * amount
        }
      }
    }
  }
  return { clips, stride }
}

// Índice del clip pedido; si no existe, Idle (nunca rompe).
export function resolveClip(clips, name) {
  const index = clips.findIndex(c => c.name === name)
  if (index >= 0) return index
  const idle = clips.findIndex(c => c.name === IDLE)
  return idle >= 0 ? idle : 0
}

// Mezcla suave hacia el clip elegido; los pesos siempre suman 1 (sin caer a la pose de enlace).
export function blendWeights(weights, selected, delta) {
  const amount = 1 - Math.exp(-7 * Math.min(Math.max(delta, 0), 0.05))
  return weights.map((weight, index) => weight + ((index === selected ? 1 : 0) - weight) * amount)
}
