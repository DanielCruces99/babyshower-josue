// Carga solo las animaciones de un .glb en Node (sin mallas ni texturas, que necesitan navegador).
import fs from 'node:fs'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

globalThis.ProgressEvent ??= class { constructor(type, data) { Object.assign(this, data) } }

export async function loadAnimations(file) {
  const buffer = fs.readFileSync(file)
  const jsonLength = buffer.readUInt32LE(12)
  const json = JSON.parse(buffer.subarray(20, 20 + jsonLength))
  for (const node of json.nodes) { delete node.mesh; delete node.skin }
  for (const key of ['meshes', 'materials', 'textures', 'images', 'samplers', 'skins']) delete json[key]
  json.buffers[0] = { byteLength: json.buffers[0].byteLength, uri: 'data:application/octet-stream;base64,' + buffer.subarray(28 + jsonLength).toString('base64') }
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const gltf = await loader.parseAsync(JSON.stringify(json), '')
  return gltf.animations
}
