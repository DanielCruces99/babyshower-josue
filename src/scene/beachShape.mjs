// Forma de la playa compartida entre JS (posiciones de personajes y cámara) y GLSL (mar y arena).
// Ejes: el mar está hacia -Z (donde se pone el sol), la arena hacia +Z (donde está la cámara).
import { PALETTE, hexToRgb } from '../config/palette.mjs'

export const BEACH = {
  shoreZ: -2, // línea de orilla promedio frente a la cámara
  bay: 0.0035, // curvatura de la bahía: la orilla avanza hacia el mar en los costados
  sandSlope: 0.05, // la arena sube hacia la cámara (m por m)
  seabedSlope: 0.08, // el fondo baja mar adentro
  maxDepth: 8,
  swash: 0.06, // vaivén vertical del agua en la orilla (m)
  swashSpeed: 0.9,
  fogDensity: 0.0032,
}

// Sol bajo, casi en el horizonte y apenas a la derecha (cabe en pantallas verticales).
export const SUN_DIRECTION = (() => {
  const v = [0.07, 0.06, -1]
  const len = Math.hypot(...v)
  return v.map(c => c / len)
})()

export const shoreZ = x => BEACH.shoreZ - x * x * BEACH.bay + Math.sin(x * 0.13) * 0.9 + Math.sin(x * 0.41 + 1.3) * 0.35

// Altura de la arena (sin el relieve de dunas, que solo aparece lejos de la zona de los personajes).
export function sandHeight(x, z) {
  const d = z - shoreZ(x)
  return d >= 0 ? d * BEACH.sandSlope : Math.max(d * BEACH.seabedSlope, -BEACH.maxDepth)
}

export const swashY = (x, t) => BEACH.swash * Math.sin(t * BEACH.swashSpeed + x * 0.05)

// Distancia máxima tierra adentro a la que llega el agua.
export const swashReach = () => BEACH.swash / BEACH.sandSlope

const f = n => n.toFixed(5)
const vec3 = hex => `vec3(${hexToRgb(hex).map(f).join(', ')})`

// Funciones GLSL equivalentes + colores de la paleta (en sRGB) + niebla y cielo.
export const BEACH_GLSL = /* glsl */ `
const vec3 C_CORAL = ${vec3(PALETTE.coral)};
const vec3 C_DURAZNO = ${vec3(PALETTE.durazno)};
const vec3 C_ARENA = ${vec3(PALETTE.arena)};
const vec3 C_TURQUESA = ${vec3(PALETTE.turquesa)};
const vec3 C_AZUL_NOCHE = ${vec3(PALETTE.azulNoche)};
const vec3 C_BLANCO_ESPUMA = ${vec3(PALETTE.blancoEspuma)};
const vec3 C_ACENTO = ${vec3(PALETTE.acento)};
const vec3 C_ROSA_PALO = ${vec3(PALETTE.rosaPalo)};
const vec3 C_LILA = ${vec3(PALETTE.lila)};
const vec3 C_DORADO = ${vec3(PALETTE.dorado)};
const vec3 HORIZON = mix(C_CORAL, C_DURAZNO, 0.35);
const vec3 SUN_DIR = vec3(${SUN_DIRECTION.map(f).join(', ')});

const float SHORE_Z = ${f(BEACH.shoreZ)};
const float BAY = ${f(BEACH.bay)};
const float SAND_SLOPE = ${f(BEACH.sandSlope)};
const float SEABED_SLOPE = ${f(BEACH.seabedSlope)};
const float MAX_DEPTH = ${f(BEACH.maxDepth)};
const float SWASH = ${f(BEACH.swash)};
const float SWASH_SPEED = ${f(BEACH.swashSpeed)};
const float FOG_DENSITY = ${f(BEACH.fogDensity)};

float shoreZ(float x) {
  return SHORE_Z - x * x * BAY + sin(x * 0.13) * 0.9 + sin(x * 0.41 + 1.3) * 0.35;
}

float sandHeight(vec2 p) {
  float d = p.y - shoreZ(p.x);
  return d >= 0.0 ? d * SAND_SLOPE : max(d * SEABED_SLOPE, -MAX_DEPTH);
}

float swashY(float x, float t) {
  return SWASH * sin(t * SWASH_SPEED + x * 0.05);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

// Gradiente del atardecer: lila arriba, rosa palo, durazno y coral en el horizonte.
vec3 skyColor(vec3 dir) {
  float h = dir.y;
  vec3 col = HORIZON;
  col = mix(col, C_DURAZNO, smoothstep(0.0, 0.07, h));
  col = mix(col, C_ROSA_PALO, smoothstep(0.05, 0.24, h));
  col = mix(col, C_LILA, smoothstep(0.22, 0.7, h));
  float s = max(dot(dir, SUN_DIR), 0.0);
  col = mix(col, C_CORAL, pow(s, 6.0) * 0.45 * (1.0 - smoothstep(0.0, 0.35, h)));
  col += C_ACENTO * pow(s, 40.0) * 0.22;
  col += C_DORADO * pow(s, 400.0) * 0.6;
  return col;
}

vec3 applyFog(vec3 col, float dist) {
  return mix(col, HORIZON, 1.0 - exp(-dist * FOG_DENSITY));
}
`
