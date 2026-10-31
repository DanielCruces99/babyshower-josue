import test from 'node:test'
import assert from 'node:assert/strict'
import { sandHeight, shoreZ, swashReach } from '../scene/beachShape.mjs'
import { HOST_SEPARATION, standingPosition } from './beachMotion.mjs'

test('los anfitriones quedan separados, centrados y sobre la arena seca', () => {
  const a = standingPosition(0, 2)
  const b = standingPosition(1, 2)
  assert.ok(Math.abs(b[0] - a[0] - HOST_SEPARATION) < 1e-9)
  assert.ok(Math.abs(a[0] + b[0]) < 1e-9)
  for (const [x, y, z] of [a, b]) {
    assert.ok(Math.abs(y - sandHeight(x, z)) < 1e-9)
    assert.ok(z - shoreZ(x) > swashReach(), 'el agua no les llega a los pies')
  }
})
