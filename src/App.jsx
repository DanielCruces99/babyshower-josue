import { useCallback, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { EVENT } from './config/event.config.js'
import { detectMobileProfile, renderSettings } from './lib/renderProfile.mjs'
import RenderLifecycle from './RenderLifecycle.jsx'
import BeachScene from './scene/BeachScene.jsx'
import FpsMeter from './scene/FpsMeter.jsx'

// Fase 2: playa de prueba con cámara fija. La máquina de 9 escenas llega en la fase 4.
const CAMERA = { position: [0, 2.3, 10], fov: 50, near: 0.1, far: 5000 }
const LOOK_AT = [0, 0.9, -4]

function TextFallback() {
  const { texts, date, venue } = EVENT
  return (
    <main className="fallback">
      <h1>{texts.tagline}</h1>
      <p>Fecha y hora: {date}</p>
      <p>Lugar: {venue.name}, {venue.address}</p>
      {venue.mapsUrl.startsWith('http') && <a className="button" href={venue.mapsUrl} target="_blank" rel="noreferrer">Ver en Google Maps</a>}
    </main>
  )
}

export default function App() {
  const mobile = useMemo(() => detectMobileProfile(), [])
  const settings = useMemo(() => renderSettings(mobile, window.devicePixelRatio), [mobile])
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const showFps = import.meta.env.DEV || new URLSearchParams(window.location.search).has('fps')
  const fpsRef = useRef(null)
  const [contextLost, setContextLost] = useState(false)
  const onContextLost = useCallback(() => setContextLost(true), [])
  const onContextRestored = useCallback(() => setContextLost(false), [])

  return (
    <div className="app">
      <Canvas
        className="scene-canvas"
        dpr={settings.dpr}
        gl={{ antialias: settings.antialias, powerPreference: 'high-performance' }}
        camera={CAMERA}
        onCreated={({ camera }) => camera.lookAt(...LOOK_AT)}
        aria-hidden="true"
      >
        <RenderLifecycle onContextLost={onContextLost} onContextRestored={onContextRestored} />
        <BeachScene settings={settings} mobile={mobile} reducedMotion={reducedMotion} />
        {showFps && <FpsMeter target={fpsRef} label={mobile ? 'perfil móvil' : 'perfil desktop'} />}
      </Canvas>

      <header className="hero">
        <p className="hero-kicker">{EVENT.texts.eventKind}</p>
        <h1>{EVENT.texts.tagline}</h1>
      </header>

      {showFps && <output className="fps" ref={fpsRef} aria-live="off" />}
      {contextLost && <TextFallback />}
    </div>
  )
}
