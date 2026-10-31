// Convierte cada carpeta public/models/source/mixamo/<personaje>/ (FBX de Mixamo) en
// public/models/source/<personaje>.glb usando Blender en modo consola. Luego: npm run optimize.
// Si Blender no está en la ruta por defecto, define BLENDER_PATH.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mixamoDir = path.join(root, 'public/models/source/mixamo')

function findBlender() {
  if (process.env.BLENDER_PATH) return process.env.BLENDER_PATH
  const base = 'C:/Program Files/Blender Foundation'
  const versions = fs.existsSync(base) ? fs.readdirSync(base).sort().reverse() : []
  for (const dir of versions) {
    const exe = path.join(base, dir, 'blender.exe')
    if (fs.existsSync(exe)) return exe
  }
  return 'blender'
}

const characters = fs.existsSync(mixamoDir)
  ? fs.readdirSync(mixamoDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
  : []
if (characters.length === 0) {
  console.log('No hay carpetas en public/models/source/mixamo/. Crea una por personaje con sus FBX.')
  process.exit(0)
}

const blender = findBlender()
const script = path.join(root, 'scripts/blender/mixamo_to_glb.py')
for (const name of characters) {
  const out = path.join(root, 'public/models/source', name + '.glb')
  const log = execFileSync(blender, ['-b', '--factory-startup', '-P', script, '--', path.join(mixamoDir, name), out], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const ok = log.split('\n').find(line => line.startsWith('GLB_OK'))
  if (!ok) {
    console.error(log)
    process.exit(1)
  }
  console.log(ok.replace('GLB_OK ', ''))
}
