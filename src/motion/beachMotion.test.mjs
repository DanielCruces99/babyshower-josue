import test from 'node:test'
import assert from 'node:assert/strict'
import { EVENT } from '../config/event.config.js'
import { sandHeight, shoreZ, swashReach } from '../scene/beachShape.mjs'
import {
  EXPLORE_BOUNDS, FACING_CAMERA, FACING_SEA, HOST_SEPARATION, WALK, WALK_DURATION,
  cameraShot, dampingAmount, exploreStep, hostAction, hostPose, hostsCenter, standingPosition, walkState,
} from './beachMotion.mjs'

const LAYOUTS = ['carga', 'bienvenida', 'llegada', 'detalles', 'programa', 'asistencia', 'regalos', 'explorar']

test('los anfitriones quedan separados, centrados y sobre la arena seca', () => {
  const a = standingPosition(0, 2)
  const b = standingPosition(1, 2)
  assert.ok(Math.abs(b[0] - a[0] - HOST_SEPARATION) < 1e-9)
  assert.ok(Math.abs(a[0] + b[0]) < 1e-9)
  for (const layout of LAYOUTS) {
    for (let i = 0; i < 2; i++) {
      const [x, y, z] = hostPose(layout, i, 2, 2).position
      assert.ok(Math.abs(y - sandHeight(x, z)) < 1e-9, `${layout}: pies sobre la arena`)
      assert.ok(z - shoreZ(x) > swashReach(), `${layout}: el agua no les llega a los pies`)
    }
  }
})

test('la caminata empieza en la bienvenida y termina donde empiezan los detalles (sin saltos)', () => {
  for (let i = 0; i < 2; i++) {
    assert.deepEqual(hostPose('llegada', i, 2, 0).position, hostPose('bienvenida', i, 2).position)
    assert.deepEqual(hostPose('llegada', i, 2, WALK_DURATION + 1).position, hostPose('detalles', i, 2).position)
  }
})

test('primero se dan la vuelta, luego caminan hacia el mar sin retroceder', () => {
  assert.equal(walkState(WALK.turnTime / 2).phase, 'turn')
  assert.equal(walkState(WALK.turnTime + 0.1).phase, 'walk')
  assert.equal(walkState(WALK_DURATION).phase, 'done')
  let lastZ = Infinity
  for (let t = 0; t <= WALK_DURATION; t += 0.1) {
    const z = hostPose('llegada', 0, 2, t).position[2]
    assert.ok(z <= lastZ + 1e-9)
    lastZ = z
  }
  assert.equal(hostPose('llegada', 0, 2, 1).rotationY, FACING_SEA)
  assert.equal(hostPose('detalles', 0, 2).rotationY, FACING_CAMERA)
})

test('la cámara siempre queda detrás (+Z), por encima de la arena y mirando hacia el mar', () => {
  for (const layout of LAYOUTS) {
    for (const portrait of [false, true]) {
      const center = hostsCenter(layout, 2, 3)
      const { position, target, fov } = cameraShot(layout, center, { portrait })
      assert.ok(position[2] > center[2] + 3, `${layout}: cámara detrás`)
      assert.ok(target[2] < position[2], `${layout}: mira hacia -Z`)
      assert.ok(position[1] > sandHeight(position[0], position[2]) + 1, `${layout}: sobre la arena`)
      assert.ok(fov >= 30 && fov <= 70)
    }
  }
})

test('con panel, los anfitriones quedan a la izquierda en horizontal y arriba en vertical', () => {
  const c = hostsCenter('detalles', 2)
  const wide = cameraShot('detalles', c)
  assert.ok(wide.position[0] > c[0] && wide.target[0] > c[0], 'cámara corrida a la derecha')
  const tall = cameraShot('detalles', c, { portrait: true })
  assert.ok(tall.target[1] < c[1], 'mira por debajo de los anfitriones')
  assert.equal(cameraShot('explorar', hostsCenter('explorar', 2)).position[0], hostsCenter('explorar', 2)[0], 'explorar sin corrimiento')
})

test('en vertical la cámara se aleja y abre el fov', () => {
  const c = hostsCenter('detalles', 2)
  assert.ok(cameraShot('detalles', c, { portrait: true }).fov > cameraShot('detalles', c).fov)
  assert.ok(cameraShot('detalles', c, { portrait: true }).position[2] > cameraShot('detalles', c).position[2])
})

test('cada anfitrión hace la acción del programa que dice la configuración, en cualquier orden', () => {
  for (const item of EVENT.program) {
    for (const host of EVENT.hosts) assert.equal(hostAction('programa', host.id, { program: item }), item.actions[host.id])
  }
  assert.equal(hostAction('programa', 'mama', {}), 'Idle')
})

test('en la bienvenida solo se anima quien habla; al caminar se usa Walking', () => {
  const line = { host: 'mama', action: 'Waving' }
  assert.equal(hostAction('bienvenida', 'mama', { welcomeLine: line }), 'Waving')
  assert.equal(hostAction('bienvenida', 'papa', { welcomeLine: line }), 'Idle')
  assert.equal(hostAction('llegada', 'papa', { walkPhase: 'turn' }), 'Idle')
  assert.equal(hostAction('llegada', 'papa', { walkPhase: 'walk' }), 'Walking')
  assert.equal(hostAction('explorar', 'papa', { dancing: { papa: true } }), 'Dance')
})

test('la exploración no sale de los límites de la playa', () => {
  let offset = [0, 0]
  for (let i = 0; i < 1000; i++) offset = exploreStep(offset, { x: 1, y: -1 }, 0.05)
  assert.deepEqual(offset, [EXPLORE_BOUNDS.x[1], EXPLORE_BOUNDS.z[0]])
  assert.deepEqual(exploreStep([1, 2], { x: 0, y: 0 }, 0.05), [1, 2])
})

test('el suavizado converge igual a 30, 60 y 120 FPS', () => {
  const settle = fps => { let v = 0; for (let i = 0; i < fps; i++) v += (1 - v) * dampingAmount(1 / fps); return v }
  assert.ok(Math.abs(settle(30) - settle(120)) < 1e-9)
  assert.ok(Math.abs(settle(60) - (1 - Math.exp(-4))) < 1e-9)
})
