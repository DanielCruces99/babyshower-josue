import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { BEACH, BEACH_GLSL } from './beachShape.mjs'

// Malla en forma de trapecio: filas densas cerca de la orilla y cada vez más separadas hasta el horizonte.
function buildOceanGeometry([cols, rows]) {
  const zNear = BEACH.shoreZ + 4 // empieza bajo la arena para que no se vea el borde
  const zFar = -1500
  const positions = new Float32Array((cols + 1) * (rows + 1) * 3)
  let i = 0
  for (let r = 0; r <= rows; r++) {
    const z = zNear + (zFar - zNear) * Math.pow(r / rows, 2.4)
    const halfWidth = 60 + (zNear - z) * 1.6
    for (let c = 0; c <= cols; c++) {
      positions[i++] = (c / cols * 2 - 1) * halfWidth
      positions[i++] = 0
      positions[i++] = z
    }
  }
  const indices = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * (cols + 1) + c
      const b = a + cols + 1
      indices.push(a, a + 1, b, a + 1, b + 1, b)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3000)
  return geometry
}

const vertexShader = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vDepth;
varying float vCrest;
${BEACH_GLSL}

// Onda de Gerstner: desplaza el vértice y acumula la tangente y la binormal para la normal exacta.
void gerstner(vec2 p, vec2 dir, float amp, float len, float steep, float atten, inout vec3 disp, inout vec3 T, inout vec3 B) {
  float k = 6.28318 / len;
  float c = sqrt(9.8 / k);
  vec2 d = normalize(dir);
  float ph = k * (dot(d, p) - c * uTime);
  float a = amp * atten;
  float qa = steep * a;
  float s = sin(ph);
  float co = cos(ph);
  disp += vec3(d.x * qa * co, a * s, d.y * qa * co);
  T += vec3(-d.x * d.x * qa * k * s, d.x * a * k * co, -d.x * d.y * qa * k * s);
  B += vec3(-d.x * d.y * qa * k * s, d.y * a * k * co, -d.y * d.y * qa * k * s);
}

void main() {
  vec2 p = position.xz;
  float depth0 = -sandHeight(p);
  // Las olas se apagan en la orilla (solo queda el vaivén) y a lo lejos (evita parpadeo).
  float atten = smoothstep(0.0, 3.0, depth0) * (1.0 - smoothstep(120.0, 600.0, length(p)));
  vec3 disp = vec3(0.0);
  vec3 T = vec3(1.0, 0.0, 0.0);
  vec3 B = vec3(0.0, 0.0, 1.0);
  gerstner(p, vec2(0.1, 1.0), 0.12, 14.0, 0.9, atten, disp, T, B);
  gerstner(p, vec2(-0.3, 1.0), 0.07, 8.0, 0.8, atten, disp, T, B);
  gerstner(p, vec2(0.45, 1.0), 0.035, 4.5, 0.7, atten, disp, T, B);
  gerstner(p, vec2(-0.6, 1.0), 0.018, 2.3, 0.6, atten, disp, T, B);
  vec3 pos = vec3(p.x, swashY(p.x, uTime), p.y) + disp;
  vNormal = normalize(cross(B, T));
  vDepth = depth0 + pos.y;
  vCrest = disp.y / 0.243;
  vWorld = (modelMatrix * vec4(pos, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vDepth;
varying float vCrest;
${BEACH_GLSL}

void main() {
  vec2 q = vWorld.xz;
  float dist = length(cameraPosition - vWorld);
  float near = 1.0 - smoothstep(10.0, 80.0, dist);

  // Rizos finos sobre las olas grandes.
  vec3 N = normalize(vNormal);
  float n1 = noise(q * 0.9 + vec2(uTime * 0.3, uTime * 0.2));
  float n2 = noise(q * 2.1 - uTime * 0.4);
  N = normalize(N + vec3(n1 - 0.5, 0.0, n2 - 0.5) * 0.14 * near);

  vec3 V = normalize(cameraPosition - vWorld);
  float depth = max(vDepth, 0.0);

  // Turquesa en la orilla, azul noche mar adentro.
  vec3 water = mix(C_TURQUESA * 1.08, C_AZUL_NOCHE, smoothstep(0.2, 5.5, depth));
  water = mix(water, C_AZUL_NOCHE, smoothstep(30.0, 250.0, dist) * 0.6);

  // Reflejo del cielo del atardecer (lo tiñe de rosa) con Fresnel.
  vec3 R = reflect(-V, N);
  R.y = abs(R.y);
  float fres = 0.04 + 0.96 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
  vec3 col = mix(water, skyColor(R), clamp(fres * 1.2, 0.0, 1.0));
  col = mix(col, C_ROSA_PALO, 0.1);

  // Camino dorado del sol sobre el agua.
  float sd = max(dot(R, SUN_DIR), 0.0);
  col += C_DORADO * (pow(sd, 350.0) * 3.0 + pow(sd, 40.0) * 0.25);

  // Espuma: línea en el borde, franjas que llegan a la orilla y crestas.
  float foamNoise = noise(q * 3.0 + uTime * 0.2);
  float edge = 1.0 - smoothstep(0.0, 0.25, depth);
  float bands = sin(depth * 10.0 - uTime * 2.0 + noise(q * 0.7) * 4.0) * 0.5 + 0.5;
  float foam = edge + (1.0 - smoothstep(0.15, 1.1, depth)) * smoothstep(0.65, 0.95, bands) * foamNoise;
  foam += smoothstep(0.55, 0.95, vCrest) * foamNoise * 0.5 * near;
  col = mix(col, C_BLANCO_ESPUMA, clamp(foam, 0.0, 1.0) * 0.9);

  gl_FragColor = vec4(applyFog(col, dist), 1.0);
}
`

export default function Ocean({ time, segments }) {
  const geometry = useMemo(() => buildOceanGeometry(segments), [segments])
  const material = useMemo(() => new THREE.ShaderMaterial({ uniforms: { uTime: time }, vertexShader, fragmentShader }), [time])
  useEffect(() => () => { geometry.dispose(); material.dispose() }, [geometry, material])
  return <mesh geometry={geometry} material={material} frustumCulled={false} />
}
