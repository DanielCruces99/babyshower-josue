// Íconos SVG en línea (sin descargas). Heredan el color del texto (currentColor).
const PATHS = {
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  food: <><path d="M5 3v8a2 2 0 0 0 2 2v8M9 3v8a2 2 0 0 1-2 2M7 3v6" /><path d="M16 21V3c2.5 1.5 3.5 4 3.5 7s-1.5 4-3.5 4" /></>,
  beer: <><path d="M6 7h10v13H6z" /><path d="M16 10h2.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H16" /><path d="M6 7a2.5 2.5 0 0 1 2-4 3 3 0 0 1 5 0 2.5 2.5 0 0 1 3 4" /><path d="M9.5 11v6M12.5 11v6" /></>,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" />,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M8 3v4M16 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  pin: <><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  map: <><path d="M9 4l-5 2v14l5-2 6 2 5-2V4l-5 2z" /><path d="M9 4v14M15 6v14" /></>,
  calendarAdd: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M8 3v4M16 3v4M12 13v5M9.5 15.5h5" /></>,
}

export default function Icon({ name, size = 22, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[name] ?? PATHS.star}
    </svg>
  )
}

// Estrella de mar: monograma de la carga y detalle decorativo de los paneles.
export function Starfish({ size = 40, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M32 4c3 0 4.5 9 6.5 15.5C45 20 58 19.5 59 22.5s-9.5 9-14 13.5c2 6.5 7.5 18 5 20s-12-6.5-18-10.5c-6 4-15.5 12.5-18 10.5s3-13.5 5-20C14.5 31.5 4 25.5 5 22.5s14-2.5 20.5-3C27.5 13 29 4 32 4z" fill="currentColor" />
      <g fill="#FFF8F0" opacity=".7">
        <circle cx="32" cy="18" r="1.6" /><circle cx="32" cy="26" r="1.6" /><circle cx="46" cy="25" r="1.4" /><circle cx="18" cy="25" r="1.4" />
        <circle cx="41" cy="44" r="1.4" /><circle cx="23" cy="44" r="1.4" /><circle cx="32" cy="34" r="2" />
      </g>
    </svg>
  )
}
