// Genera public/og-image.jpg (1200×630) para la vista previa en WhatsApp, con textos de event.config.js.
// Volver a ejecutar cuando se conozca el nombre de la bebé.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { EVENT, isPending } from '../src/config/event.config.js'
import { PALETTE as P } from '../src/config/palette.mjs'

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/og-image.jpg')
const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
const title = esc(EVENT.texts.tagline)
const subtitle = esc(EVENT.texts.eventKind + (isPending(EVENT.baby.name) ? '' : ' de ' + EVENT.baby.name) + ' · Marcona')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.lila}"/><stop offset=".45" stop-color="${P.rosaPalo}"/>
      <stop offset=".75" stop-color="${P.durazno}"/><stop offset="1" stop-color="${P.coral}"/>
    </linearGradient>
    <radialGradient id="halo"><stop offset=".55" stop-color="${P.acento}" stop-opacity=".55"/><stop offset="1" stop-color="${P.rosaPalo}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#cielo)"/>
  <circle cx="600" cy="470" r="190" fill="url(#halo)"/>
  <circle cx="600" cy="470" r="105" fill="${P.dorado}"/>
  <rect y="470" width="1200" height="160" fill="${P.turquesa}"/>
  <path d="M0 470 Q150 450 300 470 T600 470 T900 470 T1200 470 V630 H0z" fill="${P.turquesa}"/>
  <path d="M0 520 Q150 500 300 520 T600 520 T900 520 T1200 520" stroke="${P.blancoEspuma}" stroke-width="6" fill="none" opacity=".85"/>
  <rect x="560" y="482" width="80" height="6" rx="3" fill="${P.dorado}" opacity=".8"/>
  <rect x="580" y="500" width="40" height="5" rx="2.5" fill="${P.dorado}" opacity=".6"/>
  <text x="600" y="170" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="62" fill="${P.azulNoche}">${title}</text>
  <text x="600" y="240" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-weight="600" font-size="34" fill="${P.azulNoche}">${subtitle}</text>
</svg>`

await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(out)
console.log('public/og-image.jpg generado')
