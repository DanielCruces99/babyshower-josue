// Genera links personalizados ?nombre= a partir de scripts/invitados.csv (un nombre por línea,
// con o sin encabezado «nombre»). Salida: scripts/links-invitados.csv (ambos en .gitignore).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EVENT } from '../src/config/event.config.js'
import { guestLink } from '../src/lib/invitationName.mjs'

const dir = path.dirname(fileURLToPath(import.meta.url))
const input = path.join(dir, 'invitados.csv')
const output = path.join(dir, 'links-invitados.csv')

if (!fs.existsSync(input)) {
  console.error('No existe scripts/invitados.csv. Cópialo desde scripts/invitados.example.csv y agrega los nombres.')
  process.exit(1)
}

const names = fs.readFileSync(input, 'utf8').replace(/^﻿/, '')
  .split(/\r?\n/)
  .map(line => line.split(/[,;]/)[0].replace(/^"|"$/g, '').trim())
  .filter((name, i) => name && !(i === 0 && name.toLowerCase() === 'nombre'))

const csvCell = s => /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
const rows = ['nombre,link', ...names.map(name => csvCell(name) + ',' + csvCell(guestLink(EVENT.site.url, name)))]
fs.writeFileSync(output, rows.join('\n') + '\n', 'utf8')
console.log(`${names.length} links escritos en scripts/links-invitados.csv`)
