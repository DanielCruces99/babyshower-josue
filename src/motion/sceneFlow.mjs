// Máquina de estados de las 9 escenas (sin router). Pura: se prueba con node --test.
// `scene` es lo que ve la interfaz; `layout` es la escena cuya posición de cámara y personajes se muestra.
// Durante la ola, `layout` sigue en la escena de origen hasta que la ola tapa la pantalla.
export const SCENES = ['carga', 'bienvenida', 'llegada', 'detalles', 'ola', 'programa', 'asistencia', 'regalos', 'explorar']

// Lugar de la playa donde ocurre cada escena. Cambiar de lugar requiere la ola, salvo los tramos continuos.
export const PLACE = {
  carga: 'inicio',
  bienvenida: 'inicio',
  llegada: 'camino',
  detalles: 'orilla',
  programa: 'playa',
  asistencia: 'playa',
  regalos: 'playa',
  explorar: 'playa',
}
const CONTINUOUS = new Set(['bienvenida>llegada', 'llegada>detalles'])

export const NEXT = { bienvenida: 'llegada', llegada: 'detalles', detalles: 'programa', programa: 'asistencia', asistencia: 'regalos', regalos: 'explorar' }
export const BACK = { llegada: 'bienvenida', detalles: 'bienvenida', programa: 'detalles', asistencia: 'programa', regalos: 'asistencia', explorar: 'regalos' }

export const needsWave = (from, to) => PLACE[from] !== PLACE[to] && !CONTINUOUS.has(`${from}>${to}`)

export function initialFlow(scene = 'carga') {
  if (scene === 'ola') return { scene: 'ola', layout: 'detalles', waveTarget: 'programa', cut: 0 }
  return { scene, layout: scene, waveTarget: null, cut: 0 }
}

function go(state, target) {
  if (!target || state.scene === 'ola' || target === state.scene) return state
  if (needsWave(state.layout, target)) return { ...state, scene: 'ola', waveTarget: target }
  return { ...state, scene: target, layout: target }
}

export function flowReducer(state, action) {
  switch (action.type) {
    case 'loaded':
      return state.scene === 'carga' ? { ...state, scene: 'bienvenida', layout: 'bienvenida' } : state
    case 'next':
      return go(state, NEXT[state.scene])
    case 'back':
      return go(state, BACK[state.scene])
    case 'go':
      return go(state, action.scene)
    case 'arrived':
      return state.scene === 'llegada' ? go(state, 'detalles') : state
    case 'waveCovered': // la ola tapa la pantalla: se cambia la cámara y los personajes de golpe
      return state.scene === 'ola' && state.layout !== state.waveTarget ? { ...state, layout: state.waveTarget, cut: state.cut + 1 } : state
    case 'waveDone':
      return state.scene === 'ola' ? { ...state, scene: state.waveTarget, layout: state.waveTarget, waveTarget: null } : state
    default:
      return state
  }
}

export const sceneNumber = scene => SCENES.indexOf(scene) + 1
