// Reporta el peso de dist/ y falla si se pasa del presupuesto (CLAUDE.md, sección 7).
// Se mide lo que se descarga: los archivos de texto viajan con gzip (GitHub Pages lo aplica);
// .glb, .mp3, .jpg, .woff2 ya van comprimidos y se cuentan tal cual.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const MB = 1024 * 1024
const BUDGET = { code: 0.6 * MB, model: 3.5 * MB, total: 12 * MB, mobileTotal: 8 * MB }

if (!fs.existsSync(dist)) {
  console.error('No existe dist/. Ejecuta primero npm run build.')
  process.exit(1)
}

const files = fs.readdirSync(dist, { recursive: true, withFileTypes: true })
  .filter(e => e.isFile())
  .map(e => {
    const full = path.join(e.parentPath, e.name)
    const file = path.relative(dist, full).replaceAll('\\', '/')
    const raw = fs.statSync(full).size
    const bytes = /\.(js|css|html|svg|json|txt)$/.test(file) ? gzipSync(fs.readFileSync(full), { level: 9 }).length : raw
    return { file, raw, bytes }
  })
  .sort((a, b) => b.bytes - a.bytes)

const sum = list => list.reduce((n, f) => n + f.bytes, 0)
const fmt = bytes => (bytes / MB).toFixed(2) + ' MB'
const code = sum(files.filter(f => /\.(js|css)$/.test(f.file)))
const total = sum(files)

for (const f of files.slice(0, 12)) console.log(fmt(f.bytes).padStart(10), f.file, f.raw !== f.bytes ? `(sin comprimir ${fmt(f.raw)})` : '')
console.log('-'.repeat(40))
console.log(`JS + CSS (gzip): ${fmt(code)} (tope ${fmt(BUDGET.code)})`)
console.log(`Total dist/: ${fmt(total)} (tope móvil ${fmt(BUDGET.mobileTotal)}, desktop ${fmt(BUDGET.total)})`)

const errors = []
if (code > BUDGET.code) errors.push('JS + CSS supera 0.6 MB')
if (total > BUDGET.total) errors.push('dist/ supera 12 MB')
for (const f of files.filter(f => f.file.endsWith('.glb') && f.bytes > BUDGET.model)) errors.push(`${f.file} supera 3.5 MB`)
if (errors.length) {
  console.error('\n✗ Fuera de presupuesto:\n  ' + errors.join('\n  '))
  process.exit(1)
}
console.log('✓ Dentro del presupuesto')
