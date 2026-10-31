import test from 'node:test'
import assert from 'node:assert/strict'
import { fill, formatEventDate, formatEventTime, hostLabel, parseLimaDate } from './eventFormat.mjs'

test('una fecha de Lima se interpreta en UTC-5', () => {
  assert.equal(parseLimaDate('2026-12-12T15:30').toISOString(), '2026-12-12T20:30:00.000Z')
})

test('formatea fecha y hora en español de Perú sin depender de la zona del equipo', () => {
  assert.match(formatEventDate('2026-12-12T15:30'), /^Sábado,? 12 de diciembre de 2026$/)
  assert.match(formatEventTime('2026-12-12T15:30'), /^3:30\s?p\.\s?m\.$/)
})

test('lo pendiente o mal escrito se muestra tal cual, sin inventar', () => {
  assert.equal(formatEventDate('PENDIENTE'), 'PENDIENTE')
  assert.equal(formatEventTime('PENDIENTE'), 'PENDIENTE')
  assert.equal(formatEventDate('12/12/2026'), '12/12/2026')
})

test('el nombre del anfitrión cae en su etiqueta mientras esté pendiente', () => {
  assert.equal(hostLabel({ name: 'PENDIENTE', label: 'Mamá' }), 'Mamá')
  assert.equal(hostLabel({ name: 'Rosa', label: 'Mamá' }), 'Rosa')
})

test('fill reemplaza solo las variables conocidas', () => {
  assert.equal(fill('Haz bailar a {nombre}', { nombre: 'Mamá' }), 'Haz bailar a Mamá')
  assert.equal(fill('{otro}', {}), '{otro}')
})
