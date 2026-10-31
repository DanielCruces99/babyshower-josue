// Posiciones de los anfitriones sobre la arena. La fase 4 agrega la caminata y las tomas de cámara.
import { sandHeight, shoreZ } from '../scene/beachShape.mjs'

export const HOST_SEPARATION = 1.1
export const STAND_DISTANCE_FROM_SHORE = 6 // metros tierra adentro desde la orilla

// Posición de pie del anfitrión `index` de `count`, centrados en x = 0, apoyados sobre la arena.
export function standingPosition(index, count, centerX = 0) {
  const x = centerX + (index - (count - 1) / 2) * HOST_SEPARATION
  const z = shoreZ(x) + STAND_DISTANCE_FROM_SHORE
  return [x, sandHeight(x, z), z]
}
