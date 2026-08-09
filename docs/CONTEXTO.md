# Contexto del proyecto — Bonos de entrenamiento

> Pega este documento al empezar un chat nuevo. Contiene todo lo decidido
> hasta ahora para no tener que reconstruir la conversación.

---

## 1. Qué es

Sistema web para gestionar bonos de sesiones de un centro de entrenamiento.
Sustituye a **Loyicard** (servicio de terceros, ~30 €/mes) por desarrollo propio.

**Decisión de fondo:** es **solo web**. No hay app móvil, ni Apple Wallet, ni
Google Wallet. Se descartaron deliberadamente para evitar el Apple Developer
Program (99 €/año), el certificado Pass Type ID que caduca cada año, los cuatro
endpoints del PassKit Web Service, APNs y el modo demo de Google Wallet.

El deportista abre una URL en el móvil, se identifica una vez y puede añadirla
a su pantalla de inicio (PWA). Queda con icono, indistinguible de una app.
Recepción usa la misma web en ordenador o tablet.

**Los wallets nativos siguen siendo posibles a futuro**, se conectarían encima
del mismo modelo de datos sin rehacer nada. No son prioridad.

---

## 2. Servicio y reglas de negocio

Un solo servicio de momento: **entrenamiento grupal**, bonos de **10 sesiones**,
válidos **12 semanas**. Está previsto añadir más servicios después.

### Reglas confirmadas por el cliente

| Regla | Comportamiento |
|---|---|
| **Caducidad con sesiones dentro** | Se pierden, salvo que recepción intervenga con causa justificada |
| **Pausa (congelación)** | Solo recepción, con motivo escrito obligatorio. El reloj de caducidad se detiene y el deportista **no puede entrenar**. Al reactivar, los días parados se suman a la caducidad |
| **Prórroga** | Solo recepción, con motivo escrito obligatorio. 1, 2, 4 u 8 semanas. Funciona incluso sobre bonos ya caducados, así que puede rescatarlos |
| **Renovación** | Las sesiones sin usar **se arrastran** al bono nuevo. Renovar con 3 vivas da un bono de 10 + 3 = 13 |
| **Renovar un bono caducado** | No arrastra nada. Si la causa está justificada, se amplía la caducidad primero y luego se renueva |
| **Marcado de asistencia** | Lo hace recepción. Sin QR ni escáner: las clases son pequeñas y saben quién ha venido |

### Decisiones de diseño con razón detrás

- **El contador va al revés que un carné de sellos.** Lo primero y más grande es
  lo que **queda**, no lo gastado. Es lo que la gente mira y lo que empuja a renovar.
- **Anular no borra, devuelve.** El saldo se calcula siempre como
  `total − consumos no anulados`. Nunca se edita un número a mano.
- **Marcar guarda al instante.** No hay botón de "guardar" que pueda olvidarse.
  El botón "Cerrar lista" solo da la clase por terminada.
- **Clase y sesión consumida son el mismo hecho.** Quitar a alguien de una clase
  le devuelve la sesión; anular una sesión lo saca de la clase. No hay dos
  números que sincronizar.
- **La causa justificada es obligatoria** (mínimo 5 caracteres) en pausa y
  prórroga. Protege a recepción de presiones y deja rastro ante reclamaciones.
- **Los avisos son del deportista, no del centro.** Él decide si los quiere.

---

## 3. Modelo de datos

```js
cliente = {
  id, nombre, email, telefono, alta, notas,
  avisos: { ultimaSesion: bool, caducidad: bool },
  cuenta: null | { verificada: bool, creada },   // contraseña NUNCA en claro
  bonos: [bono]
}

bono = {
  id, servicio,
  sesionesBase: 10,
  arrastradas: 0,              // heredadas del bono anterior al renovar
  fechaCompra,
  fechaCaducidadBase,          // compra + 12 semanas
  consumos: [{ id, fecha }],
  ajustes: [{ id, tipo: 'prorroga'|'pausa', dias, motivo, fecha }],
  congelacion: null | { desde, motivo },
  cerrado: false               // true al renovar
}

clase = {
  id, fecha, servicio,
  cerrada: bool,
  asistentes: [{ clienteId, consumoId }]
}
```

**Derivados (nunca se guardan, se calculan):**

```
totalSesiones  = sesionesBase + arrastradas
restantes      = totalSesiones − consumos.length
caducidad      = fechaCaducidadBase + suma(ajustes.dias)
estado         = cerrado → 'renovado'
               | congelacion → 'congelado'
               | usadas >= total → 'agotado'
               | caducidad < hoy → 'caducado'
               | 'activo'
```

---

## 4. Pantallas construidas

**Deportista** (tras identificarse)
- Tarjeta del bono: número grande de sesiones restantes, medidor de segmentos
  inclinados, fecha de caducidad, días restantes
- Bandas de aviso si el bono está en pausa o tiene prórroga
- Pestañas: Sesiones (registro con fecha y hora) · Avisos (dos interruptores) ·
  Bonos anteriores (con nota de cuántas se arrastraron o caducaron)

**Recepción** (tres pestañas)
- **Pasar lista** — pantalla principal. Rejilla de fichas tocables, buscador sin
  tildes, filtros Todos / Sin marcar / Marcados, barra inferior con "Cerrar lista".
  Abajo, separados, los que no pueden entrenar con el motivo
- **Clases** — historial agrupado por día y hora, con asistentes, quitar asistente
  (devuelve la sesión), reabrir clase, y métricas de media por clase
- **Clientes y bonos** — buscador, KPIs, ficha con marcar sesión suelta, renovar,
  pausar, ampliar caducidad, anular sesiones, invitar a crear cuenta
- **Alta de deportista** — con venta del bono en el mismo paso y consentimiento
  de datos obligatorio

**Acceso**
- Registro con correo y contraseña, verificación de correo obligatoria, acceso,
  recuperación de contraseña

### El correo es la llave

Hay dos puertas de entrada: recepción da de alta al vender, y el deportista se
registra solo. Se unen **por el correo**: al registrarse, si el correo coincide
con una ficha existente, la cuenta se engancha y el bono aparece solo. Si no,
cuenta vacía con el mensaje "cuando compres un bono aparecerá aquí".

**Por eso la verificación del correo no es opcional:** sin ella, cualquiera
podría registrarse con el correo de otro y ver su historial.

---

## 5. Diseño visual

- **Tipografías:** Bricolage Grotesque (títulos y cifras), Instrument Sans
  (texto), JetBrains Mono (datos, fechas, etiquetas)
- **Paleta:** tinta `#14202b`, papel `#eef0ec`, verde alta visibilidad `#c2f04a`
  con su tono profundo `#86ab13`, ámbar `#f2a23c` para avisos, rojo `#d9484f`
  para caducado, azul frío `#4a90c4` para pausa
- **Elemento característico:** el medidor de 10 segmentos inclinados
  (`transform: skewX(-11deg)`). Las sesiones arrastradas van al final con borde
  discontinuo
- Todo en CSS propio, sin framework. Variables CSS en `:root` de `.bn`

---

## 6. Estado del repositorio

```
bonos-centro/
├── .gitignore          excluye .env, claves, node_modules, *.sqlite
├── .env.example        nombres de variables, sin valores
├── package.json        Vite + React 18
├── index.html
├── docs/CONTEXTO.md    este documento
└── src/
    ├── main.jsx
    ├── App.jsx         estado y orquestación
    ├── estilos.css
    ├── dominio/bonos.js    lógica pura: estado, restantes, caducidad
    ├── datos/ejemplo.js    datos falsos, se borran al conectar la BD
    └── componentes/
        ├── comunes.jsx     Medidor, Chip, Check, Clave
        ├── acceso.jsx      Registro, Acceso, Verificar
        ├── deportista.jsx  vista del bono
        └── recepcion.jsx   pasar lista, clases, clientes, alta
```

Un commit inicial. **Sin remoto configurado todavía.**

---

## 7. Lo que falta

**Inmediato**
- [ ] Volcar al repositorio los cambios de la v6 (registro de clases, cierre de
      lista, pestaña de historial de clases)
- [ ] Pruebas automáticas de las reglas difíciles: arrastre, congelación, prórroga
- [ ] Conectar a GitHub (lo hace el cliente, requiere sus credenciales)

**Para que funcione de verdad**
- [ ] Base de datos (los datos de ejemplo son en memoria y se pierden al recargar)
- [ ] Autenticación real — **no escribirla a mano**: Supabase Auth, Auth.js,
      Laravel Breeze, Django o el sistema de usuarios de WordPress
- [ ] Envío real de correos (Resend, Brevo) y un proceso diario que revise quién
      cumple condición de aviso
- [ ] Dominio y alojamiento — **pendiente de que el cliente los facilite**
- [ ] Rol separado para recepción: un deportista no debe poder llegar al panel
      cambiando la URL
- [ ] Copias de seguridad de la **base de datos** (Git solo guarda el código)
- [ ] RGPD: política de privacidad, exportación y borrado de datos

**Pendiente de información del cliente**
- Sobre qué está hecha la web existente (WordPress / a medida / creador tipo Wix).
  Cambia el plan de integración por completo.

**Decidido no hacer por ahora**
- Apple Wallet y Google Wallet
- QR y escáner para marcar asistencia
- Segundo servicio (el modelo ya lo contempla)

---

## 8. Avisos importantes

- **Git guarda el código, no los datos.** Cuando haya base de datos, necesita su
  propia estrategia de copias. Si se borra, el repositorio no salva ni un cliente.
- **Nunca subir `.env` ni contraseñas.** Si se cuela una en un commit, no basta
  con borrarla después: queda en el historial y hay que rotarla.
- **Las contraseñas del prototipo están en texto plano en memoria** porque no hay
  servidor. En producción van con bcrypt o argon2, gestionadas por la librería
  de autenticación.
- **No pedir a Claude que maneje credenciales.** No puede ni debe introducir
  tokens, contraseñas ni claves de API.

---

## 9. Cómo trabajar a partir de aquí

Lo que más tokens gasta es reimprimir el fichero completo en cada cambio.
Trabajar sobre ficheros del repositorio con ediciones puntuales cuesta una
fracción. Para la fase de construcción, **Claude Code** es mejor herramienta
que el chat: trabaja sobre el repositorio real y edita ficheros sueltos.

Sugerencia de chats separados, cada uno con este documento pegado al principio:

- **Visual** — pantallas, estilos, textos de interfaz
- **Backend** — base de datos, autenticación, correos, despliegue
- **Negocio** — reglas nuevas, segundo servicio, informes
