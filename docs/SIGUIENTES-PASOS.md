# Siguientes pasos

Guía para poner el proyecto en GitHub y continuar el desarrollo en Claude Code.

---

## 1. Descomprimir y arrancar

Descomprime `bonos-centro.zip` donde guardes tus proyectos. Luego, desde una
terminal dentro de la carpeta:

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173`. Debería verse igual que el prototipo del chat.

Requiere **Node 18 o superior**. Compruébalo con `node --version`.

---

## 2. Subirlo a GitHub

El repositorio ya está iniciado y tiene un commit. Solo falta enviarlo.

### 2.1 Crear el repositorio vacío

En [github.com/new](https://github.com/new):

- **Nombre:** `bonos-centro`
- **Visibilidad:** **Privado**. Importante: aunque hoy no haya datos reales,
  mañana habrá configuración y estructura de tu negocio.
- **No marques** ninguna casilla de README, .gitignore ni licencia. El proyecto
  ya los trae y si GitHub crea los suyos tendrás un conflicto en el primer envío.

### 2.2 Conectar y enviar

GitHub te mostrará la URL del repositorio. Con ella:

```bash
git remote add origin https://github.com/TU-USUARIO/bonos-centro.git
git branch -M main
git push -u origin main
```

Te pedirá identificarte. **No uses tu contraseña de GitHub**: ya no funciona para
esto. Usa un *personal access token* (Ajustes → Developer settings → Personal
access tokens) o instala [GitHub CLI](https://cli.github.com) y ejecuta
`gh auth login`, que es más cómodo y lo deja resuelto para siempre.

### 2.3 Comprobar que no se ha colado nada

```bash
git ls-files | grep -i env
```

Debe devolver **solo** `.env.example`. Si aparece `.env`, párate y avísalo antes
de seguir.

---

## 3. Continuar en Claude Code

Instala Claude Code, ábrelo en la carpeta del proyecto y empieza con esto:

```
Lee docs/CONTEXTO.md para situarte. Este es un prototipo funcional
de gestión de bonos de entrenamiento.

Quiero que hagas dos cosas:

1. Volcar al repositorio los cambios de la última versión del prototipo:
   el registro de clases (una clase se crea al marcar al primer asistente,
   agrupada por día y hora), el botón "Cerrar lista" que la da por
   terminada sin ser requisito para guardar, y la pestaña "Clases" con
   el historial, los asistentes de cada una, quitar asistente (que
   devuelve la sesión al bono) y reabrir clase.

2. Añadir pruebas automáticas con Vitest de las reglas difíciles:
   - Renovar con sesiones vivas las arrastra al bono nuevo
   - Renovar un bono caducado no arrastra nada
   - La pausa detiene la caducidad y al reactivar suma los días parados
   - La prórroga sobre un bono caducado lo devuelve a activo
   - Anular una sesión la devuelve al saldo disponible

Haz un commit por cada una de las dos tareas.
```

Después de eso, el orden natural del trabajo es:

1. **Base de datos** — sustituir `src/datos/ejemplo.js` por datos reales
2. **Autenticación** — con un proveedor probado, nunca escrita a mano
3. **Correos de aviso** — envío real y proceso diario que revise condiciones
4. **Despliegue** — cuando tengas dominio y alojamiento

---

## 4. Trabajar sin gastar de más

- Pide **cambios concretos sobre ficheros concretos**. "Añade X a
  `recepcion.jsx`" cuesta una fracción de "reescribe la aplicación".
- Empieza cada chat nuevo pegando `docs/CONTEXTO.md`.
- Mantén `docs/CONTEXTO.md` al día cuando cambie una regla de negocio. Es el
  documento que evita repetir conversaciones.
- Separa los chats por tema: visual, backend, negocio.

---

## 5. Recordatorios que no conviene olvidar

**Git guarda el código, no los datos.** Cuando exista la base de datos con
clientes y bonos reales, necesitará su propia estrategia de copias de seguridad
en el hosting. Si esa base de datos se pierde, el repositorio no recupera ni un
cliente.

**Nunca subas contraseñas.** Si se cuela una en un commit, borrarla en el
siguiente no basta: queda en el historial y hay que rotarla.

**Antes de usarlo con clientes reales** hacen falta: base de datos, autenticación
real, rol separado para recepción, y las obligaciones de RGPD (política de
privacidad, exportación y borrado de datos).

**Pendiente por tu parte:** averiguar sobre qué está construida la web que ya
tienes. Cambia por completo el plan de integración.
