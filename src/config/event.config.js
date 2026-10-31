// Todos los datos y textos del evento. Cambiar de cliente = cambiar este archivo y los assets.
// Los valores 'PENDIENTE' se reemplazan solo cuando el cliente entregue los datos reales.
export const EVENT = {
  baby: { name: 'PENDIENTE', sex: 'niña' },
  hosts: [
    { id: 'mama', name: 'PENDIENTE' },
    { id: 'papa', name: 'PENDIENTE' },
  ],
  date: 'PENDIENTE', // ISO 'YYYY-MM-DDTHH:mm', hora de Lima (UTC-5)
  durationHours: 'PENDIENTE', // para el evento del calendario (.ics)
  venue: { name: 'PENDIENTE', address: 'PENDIENTE, Marcona, Ica', mapsUrl: 'PENDIENTE' },
  rsvp: { maxPeople: 2, deadline: 'PENDIENTE' }, // el MISMO límite que valida Apps Script
  site: { url: 'https://danielcruces99.github.io/babyshower-josue/' },
  texts: {
    tagline: 'Una pequeña ola de amor está por llegar',
    // Alternativas si el cliente las prefiere (evitar «princesa» si pide un tono menos clásico).
    taglineVariants: [
      'Nuestra pequeña sirena está por llegar',
      'Viene en camino nuestra princesa del mar',
    ],
    eventKind: 'Babyshower',
    loading: 'Vienes a iluminar nuestros atardeceres',
    loadingError: 'No pudimos cargar la playa. Revisa tu conexión e inténtalo de nuevo.',
    retry: 'Reintentar',
    shareDescription: 'Te invitamos a celebrar con nosotros una tarde dorada en la orilla de Marcona.',
    welcomeGuest: 'Hola, {nombre}',
    welcomeDefault: 'Hola',
    welcome: [
      { host: 'mama', text: 'Qué alegría que estés aquí. Muy pronto conocerás a nuestra hija.' },
      { host: 'papa', text: 'Queremos que celebres con nosotros la llegada de nuestra pequeña.' },
    ],
  },
  program: [
    { id: 'fotos', time: 'PENDIENTE', title: 'Sesión de fotos', description: 'PENDIENTE', icon: 'camera', actions: { mama: 'Waving', papa: 'Standing Greeting' } },
    { id: 'comidas', time: 'PENDIENTE', title: 'Comidas', description: 'PENDIENTE', icon: 'food', actions: { mama: 'Thankful', papa: 'Thankful' } },
    { id: 'cervezas', time: 'PENDIENTE', title: 'Venta de cervezas', description: 'PENDIENTE', icon: 'beer', actions: { mama: 'Clapping', papa: 'Clapping' } },
    { id: 'show', time: 'PENDIENTE', title: 'Show infantil', description: 'PENDIENTE', icon: 'star', actions: { mama: 'Dance', papa: 'Dance' } },
  ],
  theme: { accent: '#E58C9A' }, // rosa coral (bebé niña)
}

export const isPending = value => value === 'PENDIENTE' || (typeof value === 'string' && value.startsWith('PENDIENTE'))
