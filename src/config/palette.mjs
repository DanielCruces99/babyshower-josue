// Paleta «Una ola de amor» (adaptada para niña). Fuente única para los shaders;
// styles.css repite estos valores en :root y un test verifica que coincidan.
export const PALETTE = {
  coral: '#F2876B',
  durazno: '#F7C59F',
  arena: '#EFE3CF',
  turquesa: '#2A9D8F',
  azulNoche: '#264653',
  blancoEspuma: '#FFF8F0',
  acento: '#E58C9A',
  rosaPalo: '#F6D3D5',
  lila: '#B9A3C9',
  dorado: '#E9B872',
}

// Nombre de la variable CSS de cada token (azulNoche → --azul-noche).
export const cssVarName = key => '--' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase())

// '#RRGGBB' → [r, g, b] en 0..1, en sRGB (los shaders trabajan en sRGB y escriben el color tal cual).
export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]
}
