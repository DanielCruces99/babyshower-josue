import { EVENT } from '../config/event.config.js'
import { CHARACTER_ANIMATIONS, HOST_MODELS } from '../characters/characterAnimations.mjs'

// Solo para revisar animaciones en desarrollo (o con ?debug). No forma parte de la invitación.
export default function DevAnimationPanel({ actions, onChange }) {
  return (
    <aside className="dev-panel" aria-label="Panel de prueba de animaciones">
      {EVENT.hosts.map(host => (
        <fieldset key={host.id}>
          <legend>{host.id}</legend>
          {CHARACTER_ANIMATIONS[HOST_MODELS[host.id].model].map(clip => (
            <button key={clip} type="button" aria-pressed={actions[host.id] === clip} onClick={() => onChange({ ...actions, [host.id]: clip })}>
              {clip}
            </button>
          ))}
        </fieldset>
      ))}
    </aside>
  )
}
