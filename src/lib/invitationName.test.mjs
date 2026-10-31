import test from 'node:test'
import assert from 'node:assert/strict'
import { guestLink, invitationName, sceneFromSearch } from './invitationName.mjs'

test('lee ?nombre= con tildes y espacios codificados', () => {
  assert.equal(invitationName('?nombre=Ana%20Mar%C3%ADa'), 'Ana María')
  assert.equal(invitationName('?nombre=Jos%C3%A9+Luis'), 'José Luis')
  assert.equal(invitationName('?Nombre=Rocío'), 'Rocío')
})

test('sin nombre devuelve cadena vacía', () => {
  assert.equal(invitationName(''), '')
  assert.equal(invitationName('?nombre=%20%20'), '')
})

test('limpia caracteres de control, etiquetas y largo excesivo', () => {
  assert.equal(invitationName('?nombre=%3Cb%3EAna%3C%2Fb%3E'), 'bAna/b')
  assert.equal(invitationName('?nombre=Ana%0A%0ALuz'), 'Ana Luz')
  assert.equal(invitationName('?nombre=' + 'a'.repeat(80)).length, 40)
})

test('guestLink genera un link que invitationName vuelve a leer igual', () => {
  const link = guestLink('https://danielcruces99.github.io/babyshower-josue/', ' Ana María ')
  assert.equal(link, 'https://danielcruces99.github.io/babyshower-josue/?nombre=Ana+Mar%C3%ADa')
  assert.equal(invitationName(new URL(link).search), 'Ana María')
})

test('?escena=N acepta solo escenas existentes', () => {
  assert.equal(sceneFromSearch('?escena=1', 9), 0)
  assert.equal(sceneFromSearch('?escena=9', 9), 8)
  assert.equal(sceneFromSearch('?escena=10', 9), null)
  assert.equal(sceneFromSearch('?escena=0', 9), null)
  assert.equal(sceneFromSearch('?escena=abc', 9), null)
  assert.equal(sceneFromSearch('', 9), null)
})
