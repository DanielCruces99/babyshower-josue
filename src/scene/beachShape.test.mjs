import test from 'node:test'
import assert from 'node:assert/strict'
import { BEACH, BEACH_GLSL, SUN_DIRECTION, sandHeight, shoreZ, swashReach, swashY } from './beachShape.mjs'

test('la orilla frente a la cámara está cerca de shoreZ y se curva hacia el mar en los costados', () => {
  assert.ok(Math.abs(shoreZ(0) - BEACH.shoreZ) < 1.3)
  assert.ok(shoreZ(60) < shoreZ(0) - 8)
  assert.ok(shoreZ(-60) < shoreZ(0) - 8)
})

test('la arena es continua en la orilla, sube hacia la cámara y baja mar adentro', () => {
  const z0 = shoreZ(0)
  assert.equal(sandHeight(0, z0), 0)
  assert.ok(sandHeight(0, z0 + 5) > 0)
  assert.ok(sandHeight(0, z0 - 5) < 0)
  assert.equal(sandHeight(0, z0 - 1000), -BEACH.maxDepth)
})

test('el vaivén del agua nunca pasa de swashReach tierra adentro', () => {
  for (let t = 0; t < 20; t += 0.37) {
    assert.ok(swashY(3, t) <= BEACH.swash + 1e-9)
    assert.ok(sandHeight(3, shoreZ(3) + swashReach()) >= swashY(3, t) - 1e-9)
  }
})

test('el sol está bajo, frente a la cámara y normalizado', () => {
  assert.ok(Math.abs(Math.hypot(...SUN_DIRECTION) - 1) < 1e-9)
  assert.ok(SUN_DIRECTION[1] > 0 && SUN_DIRECTION[1] < 0.1)
  assert.ok(SUN_DIRECTION[2] < 0)
})

test('el GLSL usa los mismos parámetros que JS', () => {
  assert.match(BEACH_GLSL, new RegExp(`SAND_SLOPE = ${BEACH.sandSlope.toFixed(5)}`))
  assert.match(BEACH_GLSL, new RegExp(`SHORE_Z = ${BEACH.shoreZ.toFixed(5)}`))
  assert.doesNotMatch(BEACH_GLSL, /NaN|undefined/)
})
