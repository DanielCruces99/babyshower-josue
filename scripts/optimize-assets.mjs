// Optimiza public/models/source/*.glb → public/models/*.glb:
// limpieza, clips no usados fuera, simplificación (~15 000 triángulos por personaje),
// texturas WebP (1024 px personajes, 512 px props) y compresión meshopt.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, resample, simplify, textureCompress, weld } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.join(root, 'public/models/source')
const outDir = path.join(root, 'public/models')
const CHARACTER_TRIANGLES = 15_000

// Lista de clips por personaje (se define en la fase de personajes).
async function loadKeptClips() {
  const file = path.join(root, 'src/characters/characterAnimations.mjs')
  if (!fs.existsSync(file)) return null
  const { CHARACTER_ANIMATIONS } = await import(pathToFileURL(file).href)
  return CHARACTER_ANIMATIONS
}

const countTriangles = doc => doc.getRoot().listMeshes().flatMap(m => m.listPrimitives())
  .reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0)

const mb = bytes => (bytes / 1024 / 1024).toFixed(2) + ' MB'

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready])
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
  'meshopt.decoder': MeshoptDecoder,
})

const files = fs.existsSync(sourceDir) ? fs.readdirSync(sourceDir).filter(f => f.toLowerCase().endsWith('.glb')) : []
if (files.length === 0) {
  console.log('No hay .glb en public/models/source/. Exporta desde Blender ahí y vuelve a ejecutar.')
  process.exit(0)
}

const keptClips = await loadKeptClips()
for (const file of files) {
  const name = path.basename(file, '.glb')
  const isProps = name.toLowerCase().startsWith('props')
  const doc = await io.read(path.join(sourceDir, file))
  const before = { bytes: fs.statSync(path.join(sourceDir, file)).size, triangles: countTriangles(doc) }

  const keep = !isProps && keptClips?.[name]
  if (keep) {
    for (const anim of doc.getRoot().listAnimations()) if (!keep.includes(anim.getName())) anim.dispose()
  }

  const transforms = [dedup(), prune(), resample(), weld()]
  if (!isProps && before.triangles > CHARACTER_TRIANGLES) {
    transforms.push(simplify({ simplifier: MeshoptSimplifier, ratio: CHARACTER_TRIANGLES / before.triangles, error: 0.01 }))
  }
  const size = isProps ? 512 : 1024
  transforms.push(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [size, size] }), prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }))
  await doc.transform(...transforms)

  const target = path.join(outDir, file)
  await io.write(target, doc)
  const clips = doc.getRoot().listAnimations().map(a => a.getName())
  console.log(`${file}: ${mb(before.bytes)} → ${mb(fs.statSync(target).size)} · ${before.triangles} → ${countTriangles(doc)} triángulos · clips: ${clips.join(', ') || 'ninguno'}`)
  if (keep) {
    const missing = keep.filter(c => !clips.includes(c))
    if (missing.length) console.warn(`  ⚠ faltan clips en ${file}: ${missing.join(', ')}`)
  }
}
