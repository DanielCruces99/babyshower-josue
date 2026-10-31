import test from 'node:test'
import assert from 'node:assert/strict'
import { BACK, NEXT, SCENES, flowReducer, initialFlow, needsWave } from './sceneFlow.mjs'

const run = (state, ...types) => types.reduce((s, type) => flowReducer(s, typeof type === 'string' ? { type } : type), state)

test('hay 9 escenas en el orden del CLAUDE.md', () => {
  assert.deepEqual(SCENES, ['carga', 'bienvenida', 'llegada', 'detalles', 'ola', 'programa', 'asistencia', 'regalos', 'explorar'])
})

test('el recorrido completo hacia adelante pasa por la ola entre detalles y programa', () => {
  let s = run(initialFlow(), 'loaded')
  assert.equal(s.scene, 'bienvenida')
  s = run(s, 'next')
  assert.equal(s.scene, 'llegada')
  s = run(s, 'arrived')
  assert.equal(s.scene, 'detalles')
  s = run(s, 'next')
  assert.deepEqual([s.scene, s.layout, s.waveTarget], ['ola', 'detalles', 'programa'])
  s = run(s, 'waveCovered')
  assert.deepEqual([s.scene, s.layout, s.cut], ['ola', 'programa', 1])
  s = run(s, 'waveDone', 'next', 'next', 'next')
  assert.equal(s.scene, 'explorar')
  assert.equal(run(s, 'next').scene, 'explorar') // no hay escena después
})

test('los tramos continuos no usan la ola; volver desde los detalles sí', () => {
  assert.equal(needsWave('bienvenida', 'llegada'), false)
  assert.equal(needsWave('llegada', 'detalles'), false)
  assert.equal(needsWave('detalles', 'bienvenida'), true)
  assert.equal(needsWave('programa', 'asistencia'), false)
  const s = run(initialFlow('detalles'), 'back')
  assert.deepEqual([s.scene, s.waveTarget], ['ola', 'bienvenida'])
})

test('Continuar en la caminata salta directo a los detalles', () => {
  assert.equal(run(initialFlow('llegada'), 'next').scene, 'detalles')
})

test('durante la ola se ignoran Continuar y Volver (evita dobles toques)', () => {
  const s = run(initialFlow('detalles'), 'next')
  assert.equal(run(s, 'next'), s)
  assert.equal(run(s, 'back'), s)
})

test('waveCovered es idempotente y waveDone sin ola no cambia nada', () => {
  const s = run(initialFlow('detalles'), 'next', 'waveCovered')
  assert.equal(run(s, 'waveCovered'), s)
  const d = initialFlow('detalles')
  assert.equal(run(d, 'waveDone'), d)
})

test('empezar en la escena de la ola (?escena=5) termina en el programa', () => {
  const s = run(initialFlow('ola'), 'waveCovered', 'waveDone')
  assert.equal(s.scene, 'programa')
})

test('todas las escenas con Volver o Continuar apuntan a escenas existentes', () => {
  for (const target of [...Object.values(NEXT), ...Object.values(BACK)]) assert.ok(SCENES.includes(target), target)
})
