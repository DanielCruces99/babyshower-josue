// Clips que conserva cada modelo (npm run optimize descarta el resto).
// El nombre de cada clip es el del FBX de Mixamo (Idle.fbx → 'Idle').
export const CHARACTER_ANIMATIONS = {
  ybot: ['Idle', 'Walking', 'Waving', 'Standing Greeting', 'Thankful', 'Clapping', 'Dance', 'Pose'],
}

// Qué modelo usa cada anfitrión y con qué colores se tiñe (provisional: Y Bot para ambos).
export const HOST_MODELS = {
  mama: { model: 'ybot', tint: { body: 'acento', joints: 'blancoEspuma' } },
  papa: { model: 'ybot', tint: { body: 'turquesa', joints: 'arena' } },
}

export const IDLE = 'Idle'
export const WALK = 'Walking'
// Clips que se repiten en bucle; el resto se reproduce una vez y vuelve a Idle.
export const LOOPING = /^(Idle|Walking|Dance)$/
// Clips que se quedan en su última pose (no vuelven a Idle).
export const HOLDING = /^Pose$/
// Clips que mueven las piernas; en los demás se fijan las piernas a la pose de Idle.
export const MOVES_LEGS = /^(Walking|Dance|Pose)$/

export const modelPath = model => `models/${model}.glb`
