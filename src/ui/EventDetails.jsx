import { useMemo } from 'react'
import { EVENT } from '../config/event.config.js'
import { formatEventDate, formatEventTime } from '../lib/eventFormat.mjs'
import { buildIcs, downloadIcs } from '../services/calendar.mjs'
import Icon, { Starfish } from './icons.jsx'
import SceneNav, { useSceneFocus } from './SceneNav.jsx'

const { texts, date, venue } = EVENT
const hasMap = venue.mapsUrl.startsWith('https://')

// Escena 4 · Detalles: fecha, hora y lugar, botón a Google Maps y «Agregar al calendario» (.ics).
// Mientras la fecha esté pendiente, el botón del calendario aparece desactivado.
export default function EventDetails({ onBack, onNext }) {
  const heading = useSceneFocus()
  const ics = useMemo(() => buildIcs(EVENT), [])
  return (
    <section className="scene-layer panel details" aria-labelledby="details-title">
      <Starfish className="panel-deco" size={52} />
      <p className="kicker">{texts.details.kicker}</p>
      <h1 id="details-title" ref={heading} tabIndex={-1}>{texts.details.title}</h1>
      <dl className="details-list">
        <div><Icon name="calendar" /><dt>{texts.details.date}</dt><dd>{formatEventDate(date)}</dd></div>
        <div><Icon name="clock" /><dt>{texts.details.time}</dt><dd>{formatEventTime(date)}</dd></div>
        <div><Icon name="pin" /><dt>{texts.details.place}</dt><dd>{venue.name}<small>{venue.address}</small></dd></div>
      </dl>
      <div className="details-actions">
        {hasMap && <a className="button button-ghost" href={venue.mapsUrl} target="_blank" rel="noreferrer"><Icon name="map" size={20} />{texts.details.map}</a>}
        <button type="button" className="button button-ghost" disabled={!ics} onClick={() => downloadIcs(ics)} aria-describedby={ics ? undefined : 'calendar-pending'}>
          <Icon name="calendarAdd" size={20} />{texts.details.calendar}
        </button>
        {!ics && <p id="calendar-pending" className="hint">{texts.details.calendarPending}</p>}
      </div>
      <SceneNav onBack={onBack} onNext={onNext} backAria="Volver a la bienvenida" nextAria="Continuar al programa" />
    </section>
  )
}
