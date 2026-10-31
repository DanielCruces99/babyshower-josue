import { EVENT } from '../config/event.config.js'
import { fill, hostLabel } from '../lib/eventFormat.mjs'
import Joystick from './Joystick.jsx'
import SceneNav, { useSceneFocus } from './SceneNav.jsx'

const { texts, hosts } = EVENT

// Escena 9 · Explorar la playa: joystick para mover la cámara y botones para hacer bailar a cada anfitrión.
export default function ExploreHud({ joystick, dancing, onToggleDance, onBack }) {
  const heading = useSceneFocus()
  return (
    <section className="scene-layer explore" aria-labelledby="explore-title">
      <div className="explore-head">
        <h1 id="explore-title" ref={heading} tabIndex={-1}>{texts.explore.title}</h1>
        <p className="hint">{texts.explore.hint}</p>
      </div>
      <div className="explore-controls">
        {hosts.map(host => {
          const nombre = hostLabel(host)
          return (
            <button key={host.id} type="button" className="button" aria-pressed={Boolean(dancing[host.id])} onClick={() => onToggleDance(host.id)}>
              {fill(dancing[host.id] ? texts.explore.stop : texts.explore.dance, { nombre })}
            </button>
          )
        })}
      </div>
      <Joystick value={joystick} label={texts.explore.joystick} />
      <SceneNav onBack={onBack} backLabel={texts.explore.back} />
    </section>
  )
}
