import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { EVENT } from './event.config.js'
import { PALETTE, cssVarName, hexToRgb } from './palette.mjs'

test('styles.css define en :root los mismos colores que palette.mjs', () => {
  const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
  for (const [key, hex] of Object.entries(PALETTE)) {
    const match = css.match(new RegExp(cssVarName(key) + ':\\s*(#[0-9A-Fa-f]{6})'))
    assert.ok(match, `falta ${cssVarName(key)} en styles.css`)
    assert.equal(match[1].toUpperCase(), hex.toUpperCase(), cssVarName(key))
  }
})

test('el acento del tema es el rosa coral', () => {
  assert.equal(EVENT.theme.accent, PALETTE.acento)
})

test('hexToRgb convierte a 0..1', () => {
  assert.deepEqual(hexToRgb('#FF0080'), [1, 0, 128 / 255])
})

test('las actividades del programa tienen id único y acción por anfitrión', () => {
  const ids = EVENT.program.map(p => p.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const item of EVENT.program) for (const host of EVENT.hosts) assert.ok(item.actions[host.id], `${item.id} sin acción para ${host.id}`)
})
