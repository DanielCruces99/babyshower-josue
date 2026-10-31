import { createRef, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { EVENT } from './config/event.config.js'
import { preloadCharacters } from './characters/Character.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { invitationName, sceneFromSearch } from './lib/invitationName.mjs'
import { detectMobileProfile, renderSettings } from './lib/renderProfile.mjs'
import { hostAction } from './motion/beachMotion.mjs'
import { SCENES, flowReducer, initialFlow } from './motion/sceneFlow.mjs'
import RenderLifecycle from './RenderLifecycle.jsx'
import BeachScene from './scene/BeachScene.jsx'
import FpsMeter from './scene/FpsMeter.jsx'
import WaveTransition from './scene/WaveTransition.jsx'
import DevAnimationPanel from './ui/DevAnimationPanel.jsx'
import EventDetails from './ui/EventDetails.jsx'
import ExploreHud from './ui/ExploreHud.jsx'
import IntroScreen from './ui/IntroScreen.jsx'
import Placeholder from './ui/Placeholder.jsx'
import Program from './ui/Program.jsx'
import TextFallback from './ui/TextFallback.jsx'
import WalkCaption from './ui/WalkCaption.jsx'
import Welcome from './ui/Welcome.jsx'

preloadCharacters()

const { texts, hosts, program } = EVENT
const params = new URLSearchParams(window.location.search)
// ?escena=N salta a la escena N, solo en desarrollo.
const startIndex = import.meta.env.DEV ? sceneFromSearch(window.location.search, SCENES.length) : null
const START_SCENE = startIndex === null ? 'carga' : SCENES[startIndex]
const CAMERA = { position: [0, 2.3, 18], fov: 45, near: 0.1, far: 5000 }

export default function App() {
  const mobile = useMemo(() => detectMobileProfile(), [])
  const settings = useMemo(() => renderSettings(mobile, window.devicePixelRatio), [mobile])
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const guestName = useMemo(() => invitationName(window.location.search), [])
  const showFps = import.meta.env.DEV || params.has('fps')
  const showDebug = params.has('debug')

  const [flow, dispatch] = useReducer(flowReducer, START_SCENE, initialFlow)
  const [charactersReady, setCharactersReady] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [contextLost, setContextLost] = useState(false)
  const [welcomeLine, setWelcomeLine] = useState(null)
  const [walkPhase, setWalkPhase] = useState('turn')
  const [selectedActivity, setSelectedActivity] = useState(0)
  const [dancing, setDancing] = useState({})
  const [debugActions, setDebugActions] = useState({})

  const hostRefs = useMemo(() => hosts.map(() => createRef()), [])
  const joystick = useRef({ x: 0, y: 0 })
  const fpsRef = useRef(null)

  const next = useCallback(() => dispatch({ type: 'next' }), [])
  const back = useCallback(() => dispatch({ type: 'back' }), [])
  const onLoaded = useCallback(() => dispatch({ type: 'loaded' }), [])
  const onArrived = useCallback(() => dispatch({ type: 'arrived' }), [])
  const onWaveCovered = useCallback(() => dispatch({ type: 'waveCovered' }), [])
  const onWaveDone = useCallback(() => dispatch({ type: 'waveDone' }), [])
  const onCharactersReady = useCallback(() => setCharactersReady(true), [])
  const onContextLost = useCallback(() => setContextLost(true), [])
  const onContextRestored = useCallback(() => setContextLost(false), [])
  const toggleDance = useCallback(id => setDancing(d => ({ ...d, [id]: !d[id] })), [])

  useEffect(() => {
    if (guestName) document.title = `${texts.welcomeFor} ${guestName} | ${document.title}`
  }, [guestName])

  // Al salir de la exploración nadie sigue bailando.
  useEffect(() => { if (flow.scene !== 'explorar') setDancing({}) }, [flow.scene])

  const ctx = { welcomeLine, walkPhase, program: program[selectedActivity], dancing }
  const actions = Object.fromEntries(hosts.map(h => [h.id, debugActions[h.id] ?? hostAction(flow.layout, h.id, ctx)]))

  if (loadFailed || contextLost) {
    return <div className="app"><TextFallback onRetry={loadFailed ? () => window.location.reload() : null} /></div>
  }

  return (
    <div className="app" data-scene={flow.scene}>
      <Canvas
        className="scene-canvas"
        dpr={settings.dpr}
        gl={{ antialias: settings.antialias, powerPreference: 'high-performance' }}
        camera={CAMERA}
        aria-hidden="true"
      >
        <RenderLifecycle onContextLost={onContextLost} onContextRestored={onContextRestored} />
        <ErrorBoundary onError={() => setLoadFailed(true)}>
          <BeachScene
            settings={settings} mobile={mobile} reducedMotion={reducedMotion}
            flow={flow} actions={actions} hostRefs={hostRefs} joystick={joystick}
            onWalkPhase={setWalkPhase} onArrived={onArrived} onCharactersReady={onCharactersReady}
          />
        </ErrorBoundary>
        {showFps && <FpsMeter target={fpsRef} label={mobile ? 'perfil móvil' : 'perfil desktop'} />}
      </Canvas>

      {flow.scene === 'carga' && <IntroScreen ready={charactersReady} failed={loadFailed} reducedMotion={reducedMotion} onDone={onLoaded} />}
      {flow.scene === 'bienvenida' && <Welcome guestName={guestName} onLine={setWelcomeLine} onNext={next} />}
      {flow.scene === 'llegada' && <WalkCaption onBack={back} onNext={next} />}
      {flow.scene === 'detalles' && <EventDetails onBack={back} onNext={next} />}
      {flow.scene === 'ola' && <WaveTransition reducedMotion={reducedMotion} onCovered={onWaveCovered} onDone={onWaveDone} />}
      {flow.scene === 'programa' && <Program selected={selectedActivity} onSelect={setSelectedActivity} onBack={back} onNext={next} />}
      {flow.scene === 'asistencia' && <Placeholder id="attendance" title={texts.attendance.title} text={texts.attendance.soon} onBack={back} onNext={next} backAria="Volver al programa" nextAria="Continuar a la lista de regalos" />}
      {flow.scene === 'regalos' && <Placeholder id="gifts" title={texts.gifts.title} text={texts.gifts.soon} onBack={back} onNext={next} backAria="Volver a confirmar asistencia" nextAria="Continuar a explorar la playa" />}
      {flow.scene === 'explorar' && <ExploreHud joystick={joystick} dancing={dancing} onToggleDance={toggleDance} onBack={back} />}

      {showDebug && <DevAnimationPanel actions={debugActions} onChange={setDebugActions} />}
      {showFps && <output className="fps" ref={fpsRef} aria-live="off" />}
    </div>
  )
}
