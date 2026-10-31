// Genera el archivo .ics («Agregar al calendario»). Puro: se prueba con node --test.
// Devuelve null mientras la fecha esté pendiente: no se inventan datos.
import { isPending } from '../config/event.config.js'
import { parseLimaDate } from '../lib/eventFormat.mjs'

const utcStamp = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const escapeText = text => String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
const encoder = new TextEncoder()

// RFC 5545: líneas de máximo 75 bytes; las siguientes empiezan con un espacio.
export function foldLine(line) {
  const parts = []
  let current = ''
  let size = 0
  for (const char of line) {
    const bytes = encoder.encode(char).length
    const limit = parts.length === 0 ? 75 : 74
    if (size + bytes > limit) {
      parts.push(current)
      current = ''
      size = 0
    }
    current += char
    size += bytes
  }
  parts.push(current)
  return parts.join('\r\n ')
}

export function buildIcs(event, { now = new Date() } = {}) {
  const start = parseLimaDate(event.date)
  if (!start) return null
  const hours = Number(event.durationHours)
  const host = new URL(event.site.url).host
  const summary = event.texts.eventKind + (isPending(event.baby.name) ? '' : ' de ' + event.baby.name)
  const venue = event.venue
  const location = [venue.name, venue.address].filter(v => !isPending(v)).join(', ')
  const description = [event.texts.tagline, venue.mapsUrl.startsWith('https://') ? venue.mapsUrl : ''].filter(Boolean).join('\n')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//babyshower-josue//Invitacion//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${utcStamp(start)}-babyshower@${host}`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${utcStamp(start)}`,
    ...(Number.isFinite(hours) && hours > 0 ? [`DTEND:${utcStamp(new Date(start.getTime() + hours * 3_600_000))}`] : []),
    `SUMMARY:${escapeText(summary)}`,
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${event.site.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

// Descarga el .ics en el navegador.
export function downloadIcs(text, filename = 'babyshower.ics') {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
