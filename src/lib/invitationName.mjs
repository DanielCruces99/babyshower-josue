const MAX_NAME_LENGTH = 40

// Nombre del invitado desde ?nombre= (o ?Nombre=), limpio y acotado para mostrarlo en una burbuja.
export function invitationName(search) {
  const params = new URLSearchParams(search)
  const raw = params.get('nombre') ?? params.get('Nombre') ?? ''
  return raw.replace(/[<>]/g, '').replace(/[\u0000-\u001f\s]+/g, ' ').trim().slice(0, MAX_NAME_LENGTH).trim()
}

// Link personalizado para un invitado: https://…/babyshower-josue/?nombre=Ana%20Mar%C3%ADa
export function guestLink(siteUrl, name) {
  const url = new URL(siteUrl)
  url.searchParams.set('nombre', name.trim())
  return url.href
}

// ?escena=N solo en desarrollo; devuelve el índice 0-based o null.
export function sceneFromSearch(search, sceneCount) {
  const n = Number.parseInt(new URLSearchParams(search).get('escena'), 10)
  return Number.isInteger(n) && n >= 1 && n <= sceneCount ? n - 1 : null
}
