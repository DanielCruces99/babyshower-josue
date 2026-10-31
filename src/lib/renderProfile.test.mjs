import test from 'node:test'
import assert from 'node:assert/strict'
import { clampDelta, profileOverride, renderSettings, shouldUseMobileAssets } from './renderProfile.mjs'

test('teléfonos y tablets táctiles usan el perfil móvil aunque no exista deviceMemory', () => {
  assert.equal(shouldUseMobileAssets({ coarsePointer: true, touchPoints: 5, deviceMemory: undefined }), true)
  assert.equal(shouldUseMobileAssets({ touchPoints: 5, screenWidth: 1024 }), true)
  assert.equal(shouldUseMobileAssets({ deviceMemory: 4 }), true)
  assert.equal(shouldUseMobileAssets({ saveData: true }), true)
  assert.equal(shouldUseMobileAssets({ screenWidth: 1920, deviceMemory: 16 }), false)
})

test('?perfil= fuerza el perfil', () => {
  assert.equal(profileOverride('?perfil=movil'), true)
  assert.equal(profileOverride('?perfil=desktop'), false)
  assert.equal(profileOverride('?perfil=otro'), null)
  assert.equal(profileOverride(''), null)
})

test('el perfil móvil cumple las reglas: dpr 1, sin antialias, sin HDR ni sombras', () => {
  const m = renderSettings(true, 3)
  assert.equal(m.dpr, 1)
  assert.equal(m.antialias, false)
  assert.equal(m.environment, false)
  assert.equal(m.shadows, false)
})

test('el perfil desktop limita el dpr a 2', () => {
  assert.equal(renderSettings(false, 3).dpr, 2)
  assert.equal(renderSettings(false, 1).dpr, 1)
})

test('delta se limita a 0.05 s', () => {
  assert.equal(clampDelta(4), 0.05)
  assert.equal(clampDelta(0.016), 0.016)
})
