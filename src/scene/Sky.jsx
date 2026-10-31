import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { BEACH_GLSL } from './beachShape.mjs'

const vertexShader = /* glsl */ `
varying vec3 vWorld;
void main() {
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`

const fragmentShader = /* glsl */ `
varying vec3 vWorld;
${BEACH_GLSL}
void main() {
  vec3 dir = normalize(vWorld - cameraPosition);
  vec3 col = skyColor(dir);

  // Nubes alargadas teñidas de rosa cerca del horizonte.
  float band = smoothstep(0.03, 0.09, dir.y) * (1.0 - smoothstep(0.12, 0.3, dir.y));
  float az = atan(dir.x, -dir.z);
  float cloud = smoothstep(0.55, 0.8, fbm(vec2(az * 6.0, dir.y * 40.0)));
  col = mix(col, mix(C_ROSA_PALO, C_ACENTO, 0.35), cloud * band * 0.55);

  // Disco del sol con halo rosa.
  float s = dot(dir, SUN_DIR);
  float disc = smoothstep(0.99935, 0.99952, s);
  vec3 sun = mix(C_DORADO, vec3(1.0), 0.75);
  col = mix(col, sun, disc);

  // Bajo el horizonte (casi siempre tapado por el mar) se funde con la niebla.
  col = mix(col, HORIZON, smoothstep(0.0, -0.02, dir.y));
  gl_FragColor = vec4(col, 1.0);
}
`

export default function Sky() {
  const geometry = useMemo(() => new THREE.SphereGeometry(2000, 48, 24), [])
  const material = useMemo(() => new THREE.ShaderMaterial({ vertexShader, fragmentShader, side: THREE.BackSide, depthWrite: false }), [])
  useEffect(() => () => { geometry.dispose(); material.dispose() }, [geometry, material])
  return <mesh geometry={geometry} material={material} renderOrder={-1} frustumCulled={false} />
}
