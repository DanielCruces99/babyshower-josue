// Resumen de un .glb: materiales, triángulos, texturas, escala del esqueleto y, por clip,
// duración y desplazamiento de la cadera (sirve para saber si una caminata avanza o es «In Place»).
// Uso: node scripts/inspect-model.mjs public/models/source/ybot.glb
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { MeshoptDecoder } from 'meshoptimizer'

await MeshoptDecoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
const doc = await io.read(process.argv[2])
const root = doc.getRoot()
const fmt = v => v.map(n => n.toFixed(1)).join(', ')

const triangles = root.listMeshes().flatMap(m => m.listPrimitives())
  .reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0)
console.log('Materiales:', root.listMaterials().map(m => m.getName()).join(', '))
console.log('Triángulos:', triangles, '· Texturas:', root.listTextures().length)

const parentOf = node => root.listNodes().find(n => n.listChildren().includes(node))
const hips = root.listNodes().find(n => /Hips$/.test(n.getName()))
if (hips) {
  let scale = 1
  for (let p = parentOf(hips); p; p = parentOf(p)) scale *= p.getScale()[0]
  console.log('Escala sobre la cadera:', scale)
}

for (const anim of root.listAnimations()) {
  const channel = anim.listChannels().find(c => c.getTargetNode() === hips && c.getTargetPath() === 'translation')
  const sampler = channel?.getSampler()
  if (!sampler) { console.log(anim.getName().padEnd(18), 'sin traslación de cadera'); continue }
  const out = sampler.getOutput()
  const duration = sampler.getInput().getMax([])[0]
  console.log(anim.getName().padEnd(18), `${duration.toFixed(2)} s`.padStart(8), '· cadera inicio', fmt(out.getElement(0, [])), '· fin', fmt(out.getElement(out.getCount() - 1, [])))
}
