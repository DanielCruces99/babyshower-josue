# Invitación 3D — Babyshower · Atardecer en Marcona

Invitación web 3D interactiva para un babyshower en Marcona (Ica, Perú). La temática es **"Una ola de amor": atardecer en la orilla**.
**La bebé es niña.** Todo el diseño, los textos y los detalles se adaptan a ella (ver sección 3). El nombre de la bebé está **PENDIENTE**: la carpeta se llama `babyshower-josue`, pero no se debe asumir que ese es su nombre.
Proyecto freelance de Daniel Cruces del Aguila (GitHub: DanielCruces99). **Entrega: 1 de diciembre de 2026.**

Hoja de ruta completa (temáticas, presupuesto de peso, cronograma): https://claude.ai/artifact/BpbFoUjrfJeBaMsM3ZeKoT

> Responde y escribe la interfaz en **español (Perú)**. El desarrollo es en Windows con VS Code. Los comandos de terminal deben funcionar en PowerShell o Git Bash.

---

## 1. Referencia de arquitectura

Este proyecto **reutiliza la arquitectura** de la invitación `babyboy-emiliano-noah`:

- Repo: https://github.com/11luisquispe11/babyboy-emiliano-noah
- Clónalo en una carpeta hermana, **solo para leerlo**: `git clone --depth 1 https://github.com/11luisquispe11/babyboy-emiliano-noah ../referencia-emiliano`
- Nunca copies sus modelos `.glb`, su música ni sus datos (IDs de hojas, URLs de Apps Script). Son de otro cliente.

Qué tomar de la referencia y qué cambiar:

| Archivo de la referencia | Qué se hace aquí |
| --- | --- |
| `src/App.jsx` (máquina de estados de escenas) | Portar el patrón. Todos los textos y datos se leen de `src/config/event.config.js` |
| `src/Character.jsx`, `characterMotion.mjs`, `characterAnimations.mjs` | Portar casi tal cual: mezcla con `AnimationMixer` + `blendWeights` y limpieza de clips |
| `src/sceneMotion.mjs`, `gardenMotion.mjs` (+ tests) | Reescribir como `motion/beachMotion.mjs`, con tomas de cámara para la playa |
| `src/RenderLifecycle.jsx`, `renderProfile.mjs` | Portar tal cual: pausa con pestaña oculta, pérdida de contexto WebGL, perfil móvil |
| `src/BackgroundMusic.jsx` | Portar con `preload="none"` |
| `src/Attendance.jsx`, `GiftRegistry.jsx`, `gifts/` | Portar la lógica (`requestId`, timeouts, estados) y rehacer el estilo |
| `apps-script/*.gs` | Portar con `LockService`; separar las hojas (ver sección 8) |
| `scripts/optimize-mobile.mjs`, `trim-animations.mjs` | Unificar en `scripts/optimize-assets.mjs` |
| `EscenarioV3.glb` (72 MB) | **No se usa.** Mar, arena y cielo se hacen con código |

Problemas de la referencia que **no** se deben repetir:
- Dependencias en `latest`.
- Texto corrupto por codificación: todos los archivos van en UTF-8 sin BOM.
- Hoja de asistencia legible públicamente.
- Frontend y backend con límites distintos de personas por confirmación.
- Falta de meta tags Open Graph.

---

## 2. Stack

- **React 19 + Vite**, JavaScript (JSX). No usar TypeScript salvo que Daniel lo pida.
- **@react-three/fiber + @react-three/drei + three** para el 3D.
- **CSS plano** con variables (sin Tailwind ni librerías de UI). Google Fonts en WOFF2.
- **Google Apps Script** como backend (Web App), con datos en Google Sheets.
- **GitHub Actions → GitHub Pages** para el deploy. En `vite.config.js`: `base: '/babyshower-josue/'`.
- Herramientas de assets: `@gltf-transform/core|extensions|functions|cli`, `meshoptimizer`, `sharp`.
- **Versiones exactas.** Instalar siempre con `npm install --save-exact`. Nunca `latest` ni rangos `^`.
- Node.js 22 LTS.

---

## 3. Temática: "Una ola de amor" (atardecer en Marcona)

Concepto: una tarde dorada en la orilla de Marcona, donde el desierto se encuentra con el mar. Frase principal: **"Una pequeña ola de amor está por llegar"**.

### Paleta (definir como variables CSS en `:root` y exportar también para los shaders)

| Token | Hex | Uso |
| --- | --- | --- |
| `--coral` | `#F2876B` | Sol, horizonte, detalles cálidos (el acento principal es `--acento`, ver "Adaptación para niña") |
| `--durazno` | `#F7C59F` | Cielo medio, fondos suaves |
| `--arena` | `#EFE3CF` | Fondos de tarjetas, arena clara |
| `--turquesa` | `#2A9D8F` | Mar cercano, enlaces, estados activos |
| `--azul-noche` | `#264653` | Texto principal, mar profundo, horizonte |
| `--blanco-espuma` | `#FFF8F0` | Espuma de olas, texto sobre fondos oscuros |

### Adaptación para niña

La base sigue siendo el atardecer cálido de Marcona, inclinado hacia rosas y lilas. Debe sentirse dulce y luminoso, sin caer en un rosado chillón.

Colores que se agregan a la paleta:

| Token | Hex | Uso |
| --- | --- | --- |
| `--acento` | `#E58C9A` (rosa coral) | Acento principal: botones, burbujas de diálogo, progreso, detalles activos. Sustituye a `--coral` como acento |
| `--rosa-palo` | `#F6D3D5` | Fondos de tarjetas, cielo alto del atardecer, brillos |
| `--lila` | `#B9A3C9` | Franja alta del cielo, sombras suaves, separadores |
| `--dorado` | `#E9B872` | Reflejo del sol en el agua, monograma, estrellas |

- **Cielo:** gradiente de `--lila` (arriba) a `--rosa-palo`, luego `--durazno` y `--coral` en el horizonte; el reflejo del sol en el mar va en `--dorado`.
- **Mar:** se mantiene el turquesa en la orilla, pero el reflejo del atardecer tiñe la superficie de rosa.
- **Contraste:** el texto sobre `--acento` o `--rosa-palo` siempre va en `--azul-noche`, nunca en blanco.

Detalles visuales y 3D:
- Cartel de madera con el nombre de la bebé, decorado con un lazo rosa.
- Conchas, estrellas de mar y caracolas en tonos rosa y nácar.
- Sombrilla a rayas `--rosa-palo` y `--blanco-espuma`.
- Algunas burbujas o destellos dorados en la transición de ola.
- Pantalla de carga: el sol poniéndose rodeado de un halo rosa, con un pequeño lazo o estrella de mar como monograma.

Textos (en femenino y con calidez):
- Frase principal: **"Una pequeña ola de amor está por llegar"**. Variantes: "Nuestra pequeña sirena está por llegar" y "Viene en camino nuestra princesa del mar".
- La bienvenida usa "nuestra hija" y "nuestra pequeña"; la carga, "Vienes a iluminar nuestros atardeceres".
- Si el cliente prefiere un tono menos clásico, evita "princesa" y usa "sirena" u "ola".

Todos los textos van en `event.config.js`, no en los componentes.

### Tipografía
- Títulos: **Fraunces** (600–700)
- Texto e interfaz: **Manrope** (400, 600, 700)
- Firmas y detalles manuscritos: **Caveat** (600)

### Escena 3D
- **Mar:** shader propio (`scene/Ocean.jsx`) con suma de ondas tipo Gerstner en el vértice, espuma en la orilla según la distancia a la arena, color de `--turquesa` a `--azul-noche` según la profundidad y reflejo cálido del sol. Sin texturas.
- **Arena:** plano con relieve por ruido procedural y gradiente de `--arena` a un tono más oscuro donde está mojada, junto a la orilla. Las dunas del fondo son siluetas simples.
- **Cielo:** gradiente de atardecer (`--azul-noche` arriba, `--durazno`, `--coral` en el horizonte), un disco de sol bajo y niebla para fundir el horizonte.
- **Accesorios** (un solo GLB, después de la bienvenida): sombrilla, toallas, un cartel de madera con el nombre del bebé, conchas y rocas. Usar fuentes CC0 (Poly Pizza, Kenney, Quaternius) recoloreadas con la paleta.
- **Transición entre escenas:** una ola cruza la pantalla y "lava" la escena (capa CSS o SVG que tapa el cambio de cámara, igual que el `sunlight-transition` de la referencia).
- **Pantalla de carga:** sol poniéndose sobre una línea de olas animada en CSS, con el nombre del bebé y el progreso real.

---

## 4. Flujo de escenas (máquina de estados en `App.jsx`, sin router)

1. **Carga:** progreso real (`useProgress`), botón de reintento ante error, respeta `prefers-reduced-motion`.
2. **Bienvenida personalizada:** lee `?nombre=` de la URL. Los personajes saludan en burbujas, cada una con su animación.
3. **Llegada a la orilla:** los personajes caminan por la arena hacia el mar y la cámara los sigue con `lerp` amortiguado.
4. **Detalles:** fecha, hora y lugar, con botón a Google Maps y botón **"Agregar al calendario"** (genera un `.ics`).
5. **Transición de ola.**
6. **Programa:** tarjetas seleccionables; al tocar una, los personajes cambian de animación. Las actividades salen de la configuración, **en el orden del arreglo**:
   - Sesión de fotos: animación de pose o saludo
   - Comidas: agradecen
   - Venta de cervezas: brindan o aplauden
   - Show infantil: bailan

   El orden y las actividades **pueden cambiar**. Nunca escribas actividades fijas en los componentes.
7. **Confirmar asistencia (RSVP).**
8. **Lista de regalos.**
9. **Explorar la playa:** joystick virtual y botones para hacer bailar a cada personaje. Desde aquí se vuelve a los regalos.

Cada escena tiene "Continuar" y "Volver", foco de teclado al entrar y `aria-label` en los controles. En desarrollo, `?escena=N` salta directamente a la escena N, como en la referencia.

---

## 5. Configuración única: `src/config/event.config.js`

**Todo** dato del evento vive aquí. Cambiar de cliente debe ser cambiar este archivo y los assets. Forma esperada:

```js
export const EVENT = {
  baby: { name: 'PENDIENTE', sex: 'niña' },
  hosts: [ { id: 'mama', name: 'PENDIENTE' }, { id: 'papa', name: 'PENDIENTE' } ],
  date: 'PENDIENTE',            // ISO 'YYYY-MM-DDTHH:mm' hora de Lima (UTC-5)
  venue: { name: 'PENDIENTE', address: 'PENDIENTE, Marcona, Ica', mapsUrl: 'PENDIENTE' },
  rsvp: { maxPeople: 2, deadline: 'PENDIENTE' },  // el MISMO límite que valida Apps Script
  texts: { tagline: 'Una pequeña ola de amor está por llegar', /* ... */ },
  program: [
    { id: 'fotos',    time: 'PENDIENTE', title: 'Sesión de fotos',   description: '...', icon: 'camera', actions: { mama: 'Waving', papa: 'Standing Greeting' } },
    { id: 'comidas',  time: 'PENDIENTE', title: 'Comidas',           description: '...', icon: 'food',   actions: { mama: 'Thankful', papa: 'Thankful' } },
    { id: 'cervezas', time: 'PENDIENTE', title: 'Venta de cervezas', description: '...', icon: 'beer',   actions: { mama: 'Clapping', papa: 'Clapping' } },
    { id: 'show',     time: 'PENDIENTE', title: 'Show infantil',     description: '...', icon: 'star',   actions: { mama: 'Dance', papa: 'Dance' } },
  ],
  theme: { accent: '#E58C9A' },  // rosa coral (bebé niña)
}
```

Los valores `PENDIENTE` se mantienen visibles como tales hasta que Daniel dé los datos reales. **No inventes fechas, horas, direcciones ni nombres.**

---

## 6. Estructura de carpetas

```
babyshower-josue/
  CLAUDE.md
  index.html                  ← meta Open Graph + favicon + theme-color
  vite.config.js
  public/
    models/                   ← personajes (.glb optimizados) y props.glb
    models/source/            ← originales SIN optimizar (en .gitignore)
    audio/cancion.mp3
    og-image.jpg              ← 1200×630, vista previa en WhatsApp
  src/
    main.jsx, App.jsx, styles.css
    config/event.config.js
    scene/      Ocean.jsx, Sand.jsx, Sky.jsx, Props.jsx, WaveTransition.jsx
    characters/ Character.jsx, characterMotion.mjs, characterAnimations.mjs
    motion/     beachMotion.mjs, beachMotion.test.mjs, cameraMath.mjs (+ tests)
    ui/         IntroScreen, Welcome, EventDetails, Program, Attendance, GiftRegistry, ExploreHud, Joystick
    services/   rsvpApi.js, giftApi.js, calendar.mjs (+ test)
    lib/        invitationName.mjs, renderProfile.mjs (+ tests)
    BackgroundMusic.jsx, RenderLifecycle.jsx
  apps-script/
    rsvp/Code.gs, rsvp/INSTALACION.md
    gifts/Code.gs, gifts/INSTALACION.md
  scripts/
    optimize-assets.mjs, make-guest-links.mjs
  .github/workflows/pages.yml
  .env.example
```

---

## 7. Presupuesto de peso y rendimiento (regla dura)

| Recurso | Tope móvil | Tope desktop |
| --- | --- | --- |
| JS + CSS | 0.6 MB | 0.6 MB |
| Cada personaje (7–8 animaciones) | 2.0 MB | 3.5 MB |
| Mar, arena, cielo | 0 MB (código) | 0 MB |
| props.glb | 1.5 MB | 2.5 MB |
| Fuentes | 0.2 MB | 0.2 MB |
| Música (MP3 mono 96 kbps) | 1.5 MB, carga al primer toque | igual |
| **Total** | **< 8 MB** | **< 12 MB** |

Reglas:
- No agregues un `.glb` a `public/models/` sin pasarlo por `npm run optimize`: meshopt, texturas WebP o KTX2 (1024 px para personajes, 512 px para props), simplificación a unos 15 000 triángulos por personaje y eliminación de clips no usados.
- Carga por etapas: personajes y mar primero; los props con `Suspense` después de la bienvenida; la música solo con el primer gesto del usuario.
- En el perfil móvil (`renderProfile.mjs`): `dpr=1`, sin antialias, sin `Environment` HDR y sin mapas de sombra. Usa un disco de sombra falso bajo los personajes (shader de la referencia).
- `useFrame`: nada de `setState` por fotograma; usa `useRef`. Limita `delta` a 0.05 al volver de una pestaña oculta.
- Cada vez que agregues un asset, reporta el peso total de `dist/` después de `npm run build`.
- Criterio de aceptación: menos de 6 segundos hasta la bienvenida en 4G y al menos 30 FPS en un Android de gama media.

---

## 8. Backend: Google Apps Script + Sheets

- Hay **dos proyectos de Apps Script y dos hojas separadas**:
  - **Asistencia:** privada. Columnas `Nombre | Cuántas personas | Fecha`. Solo se escribe; el `doGet` no devuelve nombres.
  - **Regalos:** columnas `Orden | Link del producto sugerido | Nombre del producto | ¿Fue comprado?`.
- El frontend **nunca** lee la hoja directamente (nada de `gviz`); todo pasa por Apps Script.
- Para los POST: cuerpo `URLSearchParams` (sin preflight CORS) y `credentials: 'omit'`. **Nunca `mode: 'no-cors'`**, porque no permite verificar que se guardó.
- RSVP: `requestId` (UUID en `sessionStorage`) para que un reintento no duplique el registro, `LockService`, el mismo `maxPeople` que la configuración, y escapar nombres que empiezan con `= + - @` (inyección de fórmulas).
- Regalos: lectura por JSONP con nombre de callback validado, compra con `LockService` y verificación de que el ítem no cambió, refresco cada 30 s solo si la pestaña está visible.
- Las URLs de las Web Apps van en `.env.example` como `VITE_RSVP_APPS_SCRIPT_URL` y `VITE_GIFTS_APPS_SCRIPT_URL`.
- Cada `apps-script/*/INSTALACION.md` explica paso a paso cómo desplegarlo desde la cuenta del cliente, en prosa y sin tablas de pasos.

---

## 9. Personajes y animaciones

- **Pendiente:** origen de los personajes (avatar desde foto, estilizado en Blender o VRoid, o mascotas). Mientras tanto se usa el **Y Bot / X Bot de Mixamo** como provisional, con las mismas animaciones.
- Animaciones necesarias (Mixamo, "In Place" desmarcado solo en Walking): `Idle`, `Walking`, `Waving`, `Standing Greeting`, `Thankful`, `Clapping`, un baile (`Dance`) y una pose para foto.
- Pipeline: FBX en T-pose → Mixamo → Blender (acciones NLA en un archivo, escala 1 unidad = 1 m) → GLB en `public/models/source/` → `npm run optimize` → `public/models/`.
- Los nombres de los clips se definen en `characters/characterAnimations.mjs`. Un clip que se pida y no exista debe volver a `Idle` sin romper.
- Trabaja sobre **clones** de los clips (`clip.clone()`), nunca sobre la caché de `useGLTF`.

---

## 10. Calidad, accesibilidad y pruebas

- La lógica pura (cámara, posiciones, transiciones, nombre desde la URL, `.ics`, perfil móvil) va en `.mjs` con tests en `node --test`. El CI no publica si un test falla.
- `prefers-reduced-motion`: sin animaciones CSS largas y transiciones instantáneas.
- Contraste AA en todo el texto: el texto sobre coral o durazno va en `--azul-noche`.
- Si se pierde el contexto WebGL, se muestra la versión de texto con fecha, hora, lugar y mapa.
- Texto mínimo de 16 px en móvil; áreas táctiles de al menos 44 px.
- Usar alturas `100dvh`, sin scroll horizontal.
- Antes de dar algo por terminado, ejecuta `npm run build` y prueba en la vista móvil de Chrome. Indica a Daniel qué revisar en un celular real.

---

## 11. Comandos

```
npm run dev            # servidor de desarrollo (http://localhost:5173/babyshower-josue/)
npm run build          # build de producción en dist/
npm run preview        # sirve dist/
npm test               # node --test "src/**/*.test.mjs"
npm run optimize       # optimiza public/models/source/*.glb → public/models/
npm run guest-links    # genera links ?nombre= desde scripts/invitados.csv
```

---

## 12. Convenciones de trabajo

- Commits pequeños en español, en imperativo (por ejemplo, "Agrega shader de olas con espuma en la orilla").
- Trabaja en ramas `feat/...` y fusiona a `main` solo lo que compila y pasa los tests. Cada push a `main` publica la invitación.
- No subas secretos. Las URLs `/exec` de Apps Script son públicas, pero los IDs de las hojas no van al frontend.
- Si una decisión cambia el peso, la arquitectura o el flujo, explícala en una línea antes de implementarla.
- Explica los pasos en prosa, no en tarjetas de pasos.

---

## 13. Hoja de ruta e hitos

| Fecha | Hito |
| --- | --- |
| 3 nov | Temática aprobada ✅ (atardecer, adaptado para niña). Pendiente: origen de los personajes |
| 9 nov | Prototipo navegable: playa procedural, personajes provisionales, las 9 escenas con datos de ejemplo |
| 16 nov | Personajes finales integrados y dentro del presupuesto de peso (ruta crítica) |
| 18 nov | RSVP y regalos funcionando contra las hojas reales del cliente |
| 23 nov | Beta pública para el cliente (una ronda de cambios incluida) |
| 1 dic | Entrega final + links personalizados por invitado |

Plan B: si los personajes finales no llegan el 16 de noviembre, se entrega con personajes estilizados provisionales o mascotas, sin mover la fecha.

---

## 14. Datos pendientes del cliente

Mantenerlos como `PENDIENTE` en la configuración hasta recibirlos:

- Nombre completo de la bebé (es niña, ya confirmado) y nombres de los papás
- Si el cliente acepta textos como "princesa" o prefiere "sirena" u "ola"
- Origen de los personajes y fotos de referencia
- Fecha y hora del evento, dirección exacta en Marcona y link de Google Maps
- Horarios del programa y orden final; precio o forma de pago de la cerveza, si se quiere mostrar
- Lista de regalos, máximo de personas por confirmación y fecha límite para confirmar
- Cuenta de Google del cliente para las hojas, canción con permiso de uso, lista de invitados

---

## 15. Primeras tareas (en orden)

1. Inicializar Vite + React en esta carpeta con versiones exactas, `vite.config.js` con `base`, workflow de Pages, `.gitignore`, `.env.example`, `event.config.js` con `PENDIENTE` y los scripts de `package.json`.
2. Escena de playa de prueba: `Ocean.jsx` (shader de olas + espuma), `Sand.jsx` y `Sky.jsx` de atardecer, con cámara fija. Medir los FPS en el perfil móvil.
3. Portar `Character.jsx`, `characterMotion.mjs`, `RenderLifecycle.jsx` y `renderProfile.mjs` con Y Bot de Mixamo como provisional.
4. Portar la máquina de estados de `App.jsx` con las 9 escenas, leyendo todo desde la configuración, y escribir `beachMotion.mjs` con sus tests.
5. Interfaz con la paleta y las tipografías: carga, bienvenida, detalles (con `.ics`), programa y transición de ola.
6. Apps Script de RSVP y regalos con sus `INSTALACION.md`, y la conexión del frontend.
