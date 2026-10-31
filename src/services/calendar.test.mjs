import test from 'node:test'
import assert from 'node:assert/strict'
import { EVENT } from '../config/event.config.js'
import { buildIcs, foldLine } from './calendar.mjs'

// Evento de ejemplo solo para el test (los datos reales siguen PENDIENTE en la configuración).
const sample = {
  ...EVENT,
  baby: { name: 'Luz', sex: 'niña' },
  date: '2026-12-12T15:30',
  durationHours: 4,
  venue: { name: 'Playa Ejemplo', address: 'Av. Ejemplo 123, Marcona, Ica', mapsUrl: 'https://maps.app.goo.gl/ejemplo' },
}
const now = new Date('2026-11-01T12:00:00Z')

test('mientras la fecha esté pendiente no se genera el .ics', () => {
  assert.equal(buildIcs(EVENT), null)
})

test('la hora de Lima se escribe en UTC y la duración define el final', () => {
  const ics = buildIcs(sample, { now })
  assert.match(ics, /\r\nDTSTART:20261212T203000Z\r\n/)
  assert.match(ics, /\r\nDTEND:20261213T003000Z\r\n/)
  assert.match(ics, /\r\nDTSTAMP:20261101T120000Z\r\n/)
  assert.match(ics, /\r\nSUMMARY:Babyshower de Luz\r\n/)
})

test('escapa comas y punto y coma, usa CRLF y cierra el calendario', () => {
  const ics = buildIcs(sample, { now })
  assert.match(ics, /LOCATION:Playa Ejemplo\\, Av. Ejemplo 123\\, Marcona\\, Ica/)
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'))
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'))
  assert.ok(!/[^\r]\n/.test(ics), 'todas las líneas terminan en CRLF')
})

test('sin duración conocida se omite DTEND; los datos pendientes del lugar no se escriben', () => {
  const ics = buildIcs({ ...sample, durationHours: 'PENDIENTE', venue: { ...EVENT.venue } }, { now })
  assert.doesNotMatch(ics, /DTEND/)
  assert.doesNotMatch(ics, /PENDIENTE/)
})

test('las líneas largas se pliegan en 75 bytes sin cortar caracteres con tilde', () => {
  const line = 'DESCRIPTION:' + 'ñandú '.repeat(30)
  const folded = foldLine(line)
  for (const part of folded.split('\r\n')) assert.ok(new TextEncoder().encode(part).length <= 75)
  assert.equal(folded.replace(/\r\n /g, ''), line)
})
