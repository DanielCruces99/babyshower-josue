// Coreografía de la playa: dónde está cada anfitrión, hacia dónde mira, qué animación hace
// y qué toma de cámara corresponde a cada escena. Pura (se prueba con node --test).
// Ejes: el mar está hacia -Z; la cámara siempre mira desde +Z.
import { sandHeight, shoreZ } from '../scene/beachShape.mjs'

export const HOST_SEPARATION = 1.1
export const FACING_CAMERA = 0
export const FACING_SEA = Math.PI

// Centro de cada lugar sobre la playa y distancia a la orilla (en metros tierra adentro).
export const SPOTS = {
  inicio: { x: 0, distance: 12 },
  orilla: { x: 0, distance: 3 },
  playa: { x: 14, distance: 5 },
}

// Caminata de la bienvenida a la orilla: primero se dan la vuelta, luego caminan.
export const WALK = { turnTime: 0.9, speed: 1.2 }
export const WALK_DISTANCE = SPOTS.inicio.distance - SPOTS.orilla.distance
export const WALK_DURATION = WALK.turnTime + WALK_DISTANCE / WALK.speed

export function walkState(elapsed) {
  if (elapsed < WALK.turnTime) return { phase: 'turn', progress: 0 }
  const progress = Math.min(1, (elapsed - WALK.turnTime) * WALK.speed / WALK_DISTANCE)
  return { phase: progress >= 1 ? 'done' : 'walk', progress }
}

// Punto sobre la arena a `distance` metros de la orilla.
export function groundPoint(x, distance) {
  const z = shoreZ(x) + distance
  return [x, sandHeight(x, z), z]
}

// Posición de pie del anfitrión `index` de `count`, centrados en `x`.
export function standingPosition(index, count, x = 0, distance = SPOTS.orilla.distance) {
  return groundPoint(x + (index - (count - 1) / 2) * HOST_SEPARATION, distance)
}

// Pose de cada anfitrión según la escena visible (layout) y el tiempo de caminata.
export function hostPose(layout, index, count, walkElapsed = 0) {
  if (layout === 'carga' || layout === 'bienvenida') {
    return { position: standingPosition(index, count, SPOTS.inicio.x, SPOTS.inicio.distance), rotationY: FACING_CAMERA }
  }
  if (layout === 'llegada') {
    const { progress } = walkState(walkElapsed)
    const distance = SPOTS.inicio.distance - WALK_DISTANCE * progress
    return { position: standingPosition(index, count, SPOTS.inicio.x, distance), rotationY: FACING_SEA }
  }
  if (layout === 'detalles') {
    return { position: standingPosition(index, count, SPOTS.orilla.x, SPOTS.orilla.distance), rotationY: FACING_CAMERA }
  }
  // Programa, asistencia, regalos y exploración: en la playa, levemente girados el uno hacia el otro.
  const turn = (index - (count - 1) / 2) * -0.35
  return { position: standingPosition(index, count, SPOTS.playa.x, SPOTS.playa.distance), rotationY: turn }
}

// Animación de cada anfitrión. `ctx`: { welcomeLine, walkPhase, program, dancing }.
export function hostAction(scene, hostId, ctx = {}) {
  switch (scene) {
    case 'bienvenida':
      return ctx.welcomeLine?.host === hostId ? ctx.welcomeLine.action ?? 'Idle' : 'Idle'
    case 'llegada':
      return ctx.walkPhase === 'walk' ? 'Walking' : 'Idle'
    case 'programa':
      return ctx.program?.actions?.[hostId] ?? 'Idle'
    case 'explorar':
      return ctx.dancing?.[hostId] ? 'Dance' : 'Idle'
    default:
      return 'Idle'
  }
}

// Tomas de cámara relativas al centro de los anfitriones: atrás (+Z), altura, a dónde mira, fov
// y `side` (corre la cámara a la derecha para que los anfitriones queden a la izquierda del panel).
// En vertical, las escenas con panel inferior miran por debajo de los anfitriones (lookHeight negativo)
// para dejarlos en el tercio superior, por encima del panel.
const PANEL_PORTRAIT = { back: 8, height: 1.4, lookHeight: -1.2, fov: 60, side: 0 }
const SHOTS = {
  bienvenida: { back: 4.4, height: 1.5, lookHeight: 1.25, lookAhead: -2, fov: 42, side: 0, portrait: { back: 6.2, fov: 58, lookHeight: 1.55 } },
  llegada: { back: 5.2, height: 2, lookHeight: 1, lookAhead: -5, fov: 48, side: 0, portrait: { back: 6.5, fov: 62 } },
  detalles: { back: 5.5, height: 1.6, lookHeight: 1.45, lookAhead: -3, fov: 45, side: 1.3, portrait: PANEL_PORTRAIT },
  playa: { back: 5.2, height: 1.7, lookHeight: 1.3, lookAhead: -3, fov: 46, side: 1.3, portrait: { ...PANEL_PORTRAIT, lookHeight: -1.6 } },
  explorar: { back: 5.2, height: 1.7, lookHeight: 1.3, lookAhead: -3, fov: 46, side: 0, portrait: { back: 7, fov: 60, lookHeight: 1.6 } },
}
const shotKey = layout => (layout in SHOTS ? layout : layout === 'carga' ? 'bienvenida' : 'playa')

export function cameraShot(layout, center, { portrait = false, explore = [0, 0] } = {}) {
  const base = SHOTS[shotKey(layout)]
  const s = portrait ? { ...base, ...base.portrait } : base
  const [ex, oz] = layout === 'explorar' ? explore : [0, 0]
  const ox = ex + s.side
  const [cx, cy, cz] = center
  return {
    position: [cx + ox, cy + s.height, cz + s.back + oz],
    target: [cx + ox, cy + s.lookHeight, cz + s.lookAhead + oz],
    fov: s.fov,
  }
}

// Centro de los anfitriones en una escena (promedio de sus posiciones).
export function hostsCenter(layout, count, walkElapsed = 0) {
  const sum = [0, 0, 0]
  for (let i = 0; i < count; i++) hostPose(layout, i, count, walkElapsed).position.forEach((v, k) => { sum[k] += v / count })
  return sum
}

// Exploración: el joystick (x, y en -1..1) mueve la cámara dentro de un área de la playa.
export const EXPLORE_BOUNDS = { x: [-9, 9], z: [-3.5, 6] }
export const EXPLORE_SPEED = 3.5

export function exploreStep([ox, oz], { x, y }, dt) {
  const clamp = (v, [min, max]) => Math.min(max, Math.max(min, v))
  return [clamp(ox + x * EXPLORE_SPEED * dt, EXPLORE_BOUNDS.x), clamp(oz + y * EXPLORE_SPEED * dt, EXPLORE_BOUNDS.z)]
}

// Suavizado independiente de los FPS (misma convergencia a 30, 60 o 120 FPS).
export const dampingAmount = (delta, speed = 4) => 1 - Math.exp(-speed * Math.max(0, delta))
