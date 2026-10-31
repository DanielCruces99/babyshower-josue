// Formato de los datos del evento para mostrar. Lo pendiente se muestra tal cual («PENDIENTE»).
import { isPending } from '../config/event.config.js'

const LIMA = 'America/Lima'

// 'YYYY-MM-DDTHH:mm' en hora de Lima (UTC-5, sin horario de verano) → Date.
export function parseLimaDate(iso) {
  if (isPending(iso) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(iso)) return null
  const date = new Date(iso + ':00-05:00')
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatEventDate(iso) {
  const date = parseLimaDate(iso)
  if (!date) return iso
  const text = new Intl.DateTimeFormat('es-PE', { timeZone: LIMA, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatEventTime(iso) {
  const date = parseLimaDate(iso)
  if (!date) return iso
  return new Intl.DateTimeFormat('es-PE', { timeZone: LIMA, hour: 'numeric', minute: '2-digit', hour12: true }).format(date)
}

// Nombre visible de un anfitrión: su nombre real o, mientras esté pendiente, su etiqueta.
export const hostLabel = host => (isPending(host.name) ? host.label : host.name)

// Reemplaza {nombre} en un texto de la configuración.
export const fill = (text, values) => text.replace(/\{(\w+)\}/g, (m, key) => values[key] ?? m)
