import { EVENT } from '../config/event.config.js'
import { formatEventDate, formatEventTime } from '../lib/eventFormat.mjs'

const { texts, date, venue } = EVENT

// Versión de texto si se pierde el contexto WebGL o falla la carga de un modelo.
export default function TextFallback({ onRetry }) {
  return (
    <section className="fallback" role="alert" aria-labelledby="fallback-title">
      <h1 id="fallback-title">{texts.fallback.title}</h1>
      <p>{texts.fallback.body}</p>
      <p><strong>{texts.tagline}</strong></p>
      <dl className="details-list">
        <div><dt>{texts.details.date}</dt><dd>{formatEventDate(date)}</dd></div>
        <div><dt>{texts.details.time}</dt><dd>{formatEventTime(date)}</dd></div>
        <div><dt>{texts.details.place}</dt><dd>{venue.name}, {venue.address}</dd></div>
      </dl>
      {venue.mapsUrl.startsWith('https://') && <a className="button" href={venue.mapsUrl} target="_blank" rel="noreferrer">{texts.details.map}</a>}
      {onRetry && <button type="button" className="button button-ghost" onClick={onRetry}>{texts.retry}</button>}
    </section>
  )
}
