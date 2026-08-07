# Bonos · Centro de entrenamiento

Gestión de bonos de sesiones para un centro de entrenamiento. Dos caras de la misma
aplicación web:

- **Deportista** — su bono con las sesiones gastadas y disponibles, la fecha de
  caducidad, el detalle de cada sesión consumida y la configuración de avisos.
- **Recepción** — pasar lista de cada clase, historial de clases, fichas de clientes,
  altas, renovaciones, pausas y prórrogas.

> **Estado actual: prototipo.** Todo vive en la memoria del navegador. No hay base de
> datos, no hay servidor y las contraseñas se guardan en texto plano solo para simular
> el acceso. **No usar con datos reales de clientes.** Ver [Pendiente](#pendiente).

---

## Arrancar en local

Requiere Node 18 o superior.

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173`.

Para probar el acceso de deportista: `marta.ribas@correo.com` / `entreno2026`.

---

## Cómo está organizado

```
src/
├── main.jsx              Punto de arranque
├── App.jsx               Estado y navegación. Nada de reglas de negocio.
├── estilos.css           Todos los estilos
├── dominio/
│   └── bonos.js          Reglas de negocio puras, sin React
├── datos/
│   └── ejemplo.js        Datos de prueba (se borran al conectar la base de datos)
└── componentes/
    ├── comunes.jsx       Medidor de sesiones, etiquetas de estado, campos
    ├── acceso.jsx        Registro, entrada y verificación de correo
    ├── deportista.jsx    Vista del bono
    └── recepcion.jsx     Pasar lista, clases, clientes, altas y diálogos
```

**La regla importante:** `dominio/bonos.js` no importa React ni sabe nada de pantallas.
Si una regla de negocio se puede escribir ahí, va ahí. Eso permite probarla por separado
y evita que la misma lógica se reescriba distinta en dos sitios.

---

## Reglas de negocio

Están todas en `src/dominio/bonos.js`.

| Concepto | Regla |
|---|---|
| Bono | 10 sesiones, válido 12 semanas desde la compra |
| Sesiones restantes | `total − consumos no anulados`. **Nunca** un número editable a mano |
| Caducidad efectiva | Fecha base + los días de las prórrogas y pausas concedidas |
| Pausa | Congela el reloj. No se puede entrenar. Al reactivar, se devuelven los días parados |
| Prórroga | Amplía la caducidad. Solo desde recepción y **exige causa justificada** |
| Renovación | Las sesiones sin usar se arrastran al bono nuevo. Si el bono ya caducó, se pierden |
| Clase | Se crea al marcar al primer asistente. Cerrarla no guarda: ya está guardado |

Una sesión consumida y un asistente a una clase son **el mismo hecho**. Quitar a alguien
de una clase le devuelve la sesión; anular la sesión desde su ficha lo saca de la clase.
No hay dos contadores que sincronizar.

---

## Pendiente

Por orden de importancia:

1. **Base de datos.** Sustituir `datos/ejemplo.js` por persistencia real.
2. **Autenticación de verdad.** No escribirla a mano: usar Supabase Auth, Auth.js, o el
   sistema de usuarios de la web existente. Contraseñas con bcrypt o argon2, verificación
   de correo obligatoria, límite de intentos y recuperación por correo.
3. **Roles separados.** Un deportista no debe poder llegar al panel de recepción
   cambiando la URL. La comprobación va en el servidor, no en la interfaz.
4. **Envío real de los avisos** por correo, con un proceso diario que revise quién cumple
   condición.
5. **Copias de seguridad automáticas de la base de datos.** Git guarda el código, no los
   datos de los clientes. Son dos seguros distintos.
6. **RGPD.** Política de privacidad, registro de actividades de tratamiento y una forma de
   exportar y borrar los datos de una persona a petición.
7. **Segundo servicio.** El modelo ya lo contempla; falta la interfaz.

---

## Seguridad

- `.env` está en `.gitignore` y **nunca** se sube. Usa `.env.example` como plantilla.
- No se suben claves, certificados ni volcados de base de datos.
- El repositorio es **privado**.
- Si alguna credencial acaba en un commit por error, no basta con borrarla en el commit
  siguiente: hay que rotarla, porque queda en el historial.
