// Todos los datos y textos del evento. Cambiar de cliente = cambiar este archivo y los assets.
// Los valores 'PENDIENTE' se reemplazan solo cuando el cliente entregue los datos reales.
export const EVENT = {
  baby: { name: 'PENDIENTE', sex: 'niña' },
  hosts: [
    { id: 'mama', name: 'PENDIENTE', label: 'Mamá' }, // label se muestra mientras el nombre esté pendiente
    { id: 'papa', name: 'PENDIENTE', label: 'Papá' },
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
    loadingStatus: 'Preparando la playa para ti…',
    loadingReady: 'Todo listo',
    welcomeFor: 'Invitación para',
    welcomeGuestDefault: 'una persona muy especial',
    // Burbujas de la bienvenida, en orden. `action` es la animación de quien habla.
    welcome: [
      { host: 'mama', action: 'Waving', text: 'Qué alegría que estés aquí. Muy pronto conocerás a nuestra hija.' },
      { host: 'papa', action: 'Standing Greeting', text: 'Queremos que celebres con nosotros la llegada de nuestra pequeña.' },
    ],
    walkCaption: 'Vamos juntos hacia la orilla…',
    wave: 'Una ola nos lleva a la siguiente sorpresa',
    details: {
      kicker: 'Te esperamos',
      title: 'Una tarde dorada en la orilla',
      date: 'Fecha',
      time: 'Hora',
      place: 'Lugar',
      map: 'Ver en Google Maps',
      calendar: 'Agregar al calendario',
      calendarPending: 'Podrás agregarlo a tu calendario cuando confirmemos la fecha.',
    },
    program: {
      kicker: 'Programa',
      title: 'Así será nuestra tarde',
      hint: 'Toca una actividad para verla',
    },
    attendance: { title: 'Confirma tu asistencia', soon: 'Muy pronto podrás confirmar tu asistencia aquí.' },
    gifts: { title: 'Lista de regalos', soon: 'Muy pronto verás aquí la lista de regalos.' },
    explore: {
      title: 'Explora la playa',
      hint: 'Usa el joystick o las flechas del teclado',
      joystick: 'Mover la cámara por la playa',
      dance: 'Haz bailar a {nombre}',
      stop: 'Detener a {nombre}',
      back: 'Volver a los regalos',
    },
    nav: { continue: 'Continuar', back: 'Volver', skip: 'Saltar' },
    fallback: {
      title: 'Tu invitación sigue aquí',
      body: 'La vista 3D se interrumpió. Estos son los datos del evento:',
    },
  },
  program: [
    { id: 'fotos', time: 'PENDIENTE', title: 'Sesión de fotos', description: 'PENDIENTE', icon: 'camera', actions: { mama: 'Pose', papa: 'Standing Greeting' } },
    { id: 'comidas', time: 'PENDIENTE', title: 'Comidas', description: 'PENDIENTE', icon: 'food', actions: { mama: 'Thankful', papa: 'Thankful' } },
    { id: 'cervezas', time: 'PENDIENTE', title: 'Venta de cervezas', description: 'PENDIENTE', icon: 'beer', actions: { mama: 'Clapping', papa: 'Clapping' } },
    { id: 'show', time: 'PENDIENTE', title: 'Show infantil', description: 'PENDIENTE', icon: 'star', actions: { mama: 'Dance', papa: 'Dance' } },
  ],
  theme: { accent: '#E58C9A' }, // rosa coral (bebé niña)
}

export const isPending = value => value === 'PENDIENTE' || (typeof value === 'string' && value.startsWith('PENDIENTE'))
