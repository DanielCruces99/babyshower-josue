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

// Contraste WCAG de las combinaciones de texto que usa la interfaz.
const luminance = hex => {
  const [r, g, b] = hexToRgb(hex).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

test('el texto normal cumple AA (4.5:1) sobre los fondos de paneles y tarjetas', () => {
  for (const bg of ['rosaPalo', 'arena', 'blancoEspuma', 'durazno', 'dorado']) {
    assert.ok(contrast(PALETTE.azulNoche, PALETTE[bg]) >= 4.5, `azul noche sobre ${bg}`)
  }
})

test('acento y turquesa solo llevan texto grande (AA para texto grande: 3:1)', () => {
  // Por eso los botones usan 19 px en negrita y el texto de la ola es grande.
  assert.ok(contrast(PALETTE.azulNoche, PALETTE.acento) >= 3)
  assert.ok(contrast(PALETTE.blancoEspuma, PALETTE.turquesa) >= 3)
  const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
  assert.match(css, /\.button \{[^}]*font: 700 1\.1875rem/, 'botones en 19 px negrita')
})

test('hexToRgb convierte a 0..1', () => {
  assert.deepEqual(hexToRgb('#FF0080'), [1, 0, 128 / 255])
})

test('las actividades del programa tienen id único y acción por anfitrión', () => {
  const ids = EVENT.program.map(p => p.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const item of EVENT.program) for (const host of EVENT.hosts) assert.ok(item.actions[host.id], `${item.id} sin acción para ${host.id}`)
})
