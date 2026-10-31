import { EVENT } from '../config/event.config.js'
import { formatEventDate, formatEventTime } from '../lib/eventFormat.mjs'
import SceneNav, { useSceneFocus } from './SceneNav.jsx'

const { texts, date, venue } = EVENT
const hasMap = venue.mapsUrl.startsWith('https://')

// Escena 4 · Detalles: fecha, hora y lugar con botón a Google Maps. El .ics llega en la fase 5.
export default function EventDetails({ onBack, onNext }) {
  const heading = useSceneFocus()
  return (
    <section className="scene-layer panel details" aria-labelledby="details-title">
      <p className="kicker">{texts.details.kicker}</p>
      <h1 id="details-title" ref={heading} tabIndex={-1}>{texts.details.title}</h1>
      <dl className="details-list">
        <div><dt>{texts.details.date}</dt><dd>{formatEventDate(date)}</dd></div>
        <div><dt>{texts.details.time}</dt><dd>{formatEventTime(date)}</dd></div>
        <div><dt>{texts.details.place}</dt><dd>{venue.name}<br /><small>{venue.address}</small></dd></div>
      </dl>
      {hasMap && <a className="button button-ghost" href={venue.mapsUrl} target="_blank" rel="noreferrer">{texts.details.map} <span aria-hidden="true">↗</span></a>}
      <SceneNav onBack={onBack} onNext={onNext} backAria="Volver a la bienvenida" nextAria="Continuar al programa" />
    </section>
  )
}
