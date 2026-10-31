import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { AnimationClip, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three'
import { CHARACTER_ANIMATIONS } from './characterAnimations.mjs'
import { blendWeights, prepareCharacterClips, resolveClip, verticalAxis } from './characterMotion.mjs'

// Esqueleto mínimo con el eje vertical en Z (como exporta Blender con Mixamo): cadera a 100 de altura.
const hips = (name, values, times = [0, 1]) => new VectorKeyframeTrack(name + '.position', times, values)
const leg = values => new QuaternionKeyframeTrack('mixamorigLeftUpLeg.quaternion', [0, 1], values)
const arm = values => new QuaternionKeyframeTrack('mixamorigRightArm.quaternion', [0, 1], values)
const ID = [0, 0, 0, 1]
const TURN = [0, Math.SQRT1_2, 0, Math.SQRT1_2]

function fakeClips() {
  return [
    new AnimationClip('Idle', 1, [hips('mixamorigHips', [0, 0, 100, 0, 0, 100]), leg([...ID, ...ID]), arm([...ID, ...ID])]),
    new AnimationClip('Walking', 1, [hips('mixamorigHips', [0, 0, 100, 0, 75, 103, 0, 150, 100], [0, 0.5, 1]), leg([...ID, ...TURN]), arm([...ID, ...TURN])]),
    new AnimationClip('Waving', 1, [hips('mixamorigHips', [5, 5, 100, 9, 9, 100]), leg([...TURN, ...TURN]), arm([...ID, ...TURN])]),
    new AnimationClip('Pose', 0.03, [hips('mixamorigHips', [0, 0, 100], [0]), arm([...TURN, ...TURN])]),
    new AnimationClip('Sobrante', 1, [arm([...ID, ...ID])]),
  ]
}

test('detecta el eje vertical por la altura de la cadera', () => {
  assert.equal(verticalAxis(hips('h', [0, 0, 100, 1, 2, 98])), 2)
  assert.equal(verticalAxis(hips('h', [0, 95, 0, 1, 97, 2])), 1)
})

test('trabaja sobre clones y descarta clips que no están en la lista', () => {
  const originals = fakeClips()
  const snapshot = originals.map(c => c.tracks.map(t => Array.from(t.values)))
  const { clips } = prepareCharacterClips(originals, 'ybot', 0.01)
  assert.ok(!clips.some(c => c.name === 'Sobrante'))
  assert.deepEqual(originals.map(c => c.tracks.map(t => Array.from(t.values))), snapshot)
})

test('la caminata queda en el sitio, conserva el sube y baja y mide la zancada en metros', () => {
  const { clips, stride } = prepareCharacterClips(fakeClips(), 'ybot', 0.01)
  const walk = clips.find(c => c.name === 'Walking').tracks[0].values
  assert.ok(Math.abs(stride - 1.5) < 1e-9)
  assert.equal(walk[1], 0) // sin avance horizontal a mitad del paso
  assert.equal(walk[4], 0)
  assert.ok(walk[5] > walk[2]) // el paso sube
})

test('en los gestos de brazos las piernas y la cadera se fijan a la pose de Idle', () => {
  const { clips } = prepareCharacterClips(fakeClips(), 'ybot', 0.01)
  const waving = clips.find(c => c.name === 'Waving')
  assert.deepEqual(Array.from(waving.tracks[0].values), [0, 0, 100, 0, 0, 100])
  assert.deepEqual(Array.from(waving.tracks[1].values), [...ID, ...ID])
  Array.from(waving.tracks[2].values).slice(4).forEach((v, i) => assert.ok(Math.abs(v - TURN[i]) < 1e-6)) // el brazo sí se mueve
})

test('las poses de un fotograma se alargan para que el mezclador no divida entre cero', () => {
  const { clips } = prepareCharacterClips(fakeClips(), 'ybot', 0.01)
  assert.ok(clips.find(c => c.name === 'Pose').duration >= 0.5)
})

test('un clip inexistente vuelve a Idle', () => {
  const { clips } = prepareCharacterClips(fakeClips(), 'ybot', 0.01)
  assert.equal(clips[resolveClip(clips, 'NoExiste')].name, 'Idle')
  assert.equal(clips[resolveClip(clips, 'Waving')].name, 'Waving')
})

test('los cambios rápidos de animación mantienen el peso total en 1', () => {
  let weights = [1, 0, 0, 0]
  for (let i = 0; i < 1000; i++) {
    weights = blendWeights(weights, i % 4, 1 / 60)
    assert.ok(Math.abs(weights.reduce((a, b) => a + b, 0) - 1) < 1e-10)
    assert.ok(weights.every(w => w >= 0 && w <= 1))
  }
})

// Prueba con el modelo real optimizado (se salta si todavía no existe).
const model = 'public/models/ybot.glb'
test('ybot.glb trae exactamente los clips de la lista', { skip: !fs.existsSync(model) && 'falta ' + model }, async () => {
  const { loadAnimations } = await import('./loadAnimations.testutil.mjs')
  const animations = await loadAnimations(model)
  assert.deepEqual(animations.map(a => a.name).sort(), [...CHARACTER_ANIMATIONS.ybot].sort())
  const { clips, stride } = prepareCharacterClips(animations, 'ybot', 0.01)
  for (const clip of clips) for (const track of clip.tracks) assert.ok(track.values.every(Number.isFinite), clip.name)
  assert.ok(stride > 0.3 && stride < 2.5, `zancada ${stride}`)
})
