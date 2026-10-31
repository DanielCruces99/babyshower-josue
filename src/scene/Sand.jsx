import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { BEACH_GLSL } from './beachShape.mjs'

const vertexShader = /* glsl */ `
varying vec3 vWorld;
${BEACH_GLSL}

// Relieve de dunas: solo tierra adentro y en los costados de la bahía, lejos de los personajes.
float duneRelief(vec2 p) {
  float d = p.y - shoreZ(p.x);
  float inland = smoothstep(6.0, 30.0, d) * 2.5 + smoothstep(25.0, 90.0, abs(p.x)) * smoothstep(2.0, 12.0, d) * 7.0;
  return fbm(p * 0.045) * inland;
}

void main() {
  vec2 p = position.xz;
  vWorld = vec3(p.x, sandHeight(p) + duneRelief(p), p.y);
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
${BEACH_GLSL}

void main() {
  vec2 q = vWorld.xz;
  float dist = length(cameraPosition - vWorld);
  vec3 N = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (N.y < 0.0) N = -N;

  float d = q.y - shoreZ(q.x);
  float reach = SWASH / SAND_SLOPE;
  float waterLine = swashY(q.x, uTime) / SAND_SLOPE;
  float wet = 1.0 - smoothstep(reach, reach + 0.9, d);
  float fresh = (1.0 - smoothstep(waterLine, waterLine + 0.7, d)) * wet;

  // Ondulaciones que deja el viento en la arena seca (el agua las borra junto a la orilla).
  float ripple = sin(dot(q, vec2(2.2, 0.9)) * 1.6 + fbm(q * 0.5) * 6.0);
  float rippleFade = (1.0 - smoothstep(6.0, 35.0, dist)) * (1.0 - wet);
  N = normalize(N + vec3(ripple * 0.06, 0.0, ripple * 0.22) * rippleFade);

  vec3 V = normalize(cameraPosition - vWorld);
  float grain = noise(q * 45.0) * 0.06 - 0.03;
  vec3 dry = mix(C_ARENA, C_DURAZNO, 0.15 + fbm(q * 0.35) * 0.15) + grain;
  // La arena mojada refleja un poco el cielo rosado.
  vec3 wetCol = mix(C_ARENA * vec3(0.8, 0.74, 0.74), skyColor(reflect(-V, N)), 0.25);
  vec3 base = mix(dry, wetCol, max(wet * 0.7, fresh));

  // Luz envolvente: sombras lilas, luz cálida del sol bajo.
  float wrap = dot(N, normalize(SUN_DIR + vec3(0.0, 0.5, 0.0))) * 0.5 + 0.5;
  vec3 col = base * mix(vec3(0.8, 0.76, 0.88), vec3(1.06, 0.98, 0.92), wrap);

  // Brillo dorado del sol sobre la arena mojada.
  float spec = pow(max(dot(reflect(-V, N), SUN_DIR), 0.0), 60.0);
  col += C_DORADO * spec * (wet * 0.35 + fresh * 0.5);

  gl_FragColor = vec4(applyFog(col, dist), 1.0);
}
`

// Siluetas de dunas al fondo, a los lados de la bahía.
const DUNES = [
  { position: [-150, -4, -95], scale: [70, 16, 30] },
  { position: [-230, -6, -190], scale: [110, 26, 40] },
  { position: [170, -5, -120], scale: [80, 14, 32] },
  { position: [260, -6, -230], scale: [120, 30, 45] },
]

const duneVertex = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
void main() {
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`

const duneFragment = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
${BEACH_GLSL}
void main() {
  float wrap = dot(normalize(vNormal), SUN_DIR) * 0.5 + 0.5;
  vec3 col = mix(C_DURAZNO * vec3(0.78, 0.72, 0.82), C_ARENA, wrap);
  gl_FragColor = vec4(applyFog(col, length(cameraPosition - vWorld) * 0.8), 1.0);
}
`

export default function Sand({ time, mobile }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(500, 170, mobile ? 120 : 220, mobile ? 70 : 120)
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, -45)
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 400)
    return g
  }, [mobile])
  const material = useMemo(() => new THREE.ShaderMaterial({ uniforms: { uTime: time }, vertexShader, fragmentShader }), [time])
  const duneGeometry = useMemo(() => new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), [])
  const duneMaterial = useMemo(() => new THREE.ShaderMaterial({ vertexShader: duneVertex, fragmentShader: duneFragment }), [])
  useEffect(() => () => {
    geometry.dispose(); material.dispose(); duneGeometry.dispose(); duneMaterial.dispose()
  }, [geometry, material, duneGeometry, duneMaterial])

  return (
    <group>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
      {DUNES.map((dune, i) => <mesh key={i} geometry={duneGeometry} material={duneMaterial} position={dune.position} scale={dune.scale} />)}
    </group>
  )
}
