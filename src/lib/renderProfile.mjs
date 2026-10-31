export function shouldUseMobileAssets({ coarsePointer = false, touchPoints = 0, screenWidth = 1920, deviceMemory = 8, saveData = false } = {}) {
  return coarsePointer || (touchPoints > 0 && screenWidth <= 1366) || deviceMemory <= 4 || saveData
}

// ?perfil=movil o ?perfil=desktop fuerzan un perfil (sirve para medir FPS móviles en Chrome de escritorio).
export function profileOverride(search) {
  const value = new URLSearchParams(search).get('perfil')
  return value === 'movil' ? true : value === 'desktop' ? false : null
}

// Ajustes del <Canvas> y de la escena según el perfil.
export function renderSettings(mobile, devicePixelRatio = 1) {
  return mobile
    ? { dpr: 1, antialias: false, shadows: false, environment: false, oceanSegments: [96, 128] }
    : { dpr: Math.min(devicePixelRatio, 2), antialias: true, shadows: true, environment: true, oceanSegments: [192, 256] }
}

// Lee el dispositivo actual (solo en navegador).
export function detectMobileProfile(win = globalThis.window) {
  const forced = profileOverride(win.location.search)
  if (forced !== null) return forced
  return shouldUseMobileAssets({
    coarsePointer: win.matchMedia?.('(pointer: coarse)').matches ?? false,
    touchPoints: win.navigator.maxTouchPoints ?? 0,
    screenWidth: win.screen?.width ?? 1920,
    deviceMemory: win.navigator.deviceMemory ?? 8,
    saveData: win.navigator.connection?.saveData ?? false,
  })
}

// Al volver de una pestaña oculta, delta puede ser de varios segundos: se limita a 0.05.
export const clampDelta = delta => Math.min(delta, 0.05)
