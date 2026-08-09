# Adaptación visual al sistema MOVE

Especificación para alinear el sistema de bonos con la identidad de
move.vendoo.ad. Pensado para pegarse en Claude Code.

---

## Lo que cambia respecto al prototipo actual

| Elemento | Prototipo | MOVE |
|---|---|---|
| Esquinas | 8–16 px redondeadas | **0 px.** Rectángulos exactos |
| Separación | Bordes de caja + sombras | **Líneas de 1 px.** Sin sombras |
| Fondo claro | Hueso `#eef0ec` | Blanco puro `#FFFFFF` |
| Fondo oscuro | — | `#111112` |
| Texto sobre oscuro | Blanco puro | Hueso cálido `#F5F3EF` |
| Acento | Verde alta visibilidad | **Ninguno.** Monocromo |
| Botón principal | Verde con borde | Rectángulo sólido, sin radio |
| Enlaces de acción | Botones | Texto + flecha `→` |
| Etiquetas de sección | `EYEBROW` | `(01) EYEBROW` con numeración |

---

## Variables

Sustituir el bloque `:root` de `estilos.css`:

```css
.bn {
  /* superficies */
  --tinta:        #111112;   /* negro MOVE */
  --tinta-alta:   #1A1A1C;   /* superficie oscura elevada (pie, tarjetas) */
  --blanco:       #FFFFFF;   /* fondo claro */
  --hueso:        #F5F3EF;   /* texto y botones sobre oscuro */

  /* texto */
  --texto:        #111112;
  --texto-2:      #55555A;   /* secundario sobre claro */
  --texto-3:      #8E8E93;   /* etiquetas, numeración */
  --texto-inv:    #F5F3EF;   /* sobre oscuro */
  --texto-inv-2:  #9A9A9E;   /* secundario sobre oscuro */

  /* líneas — el recurso estructural principal */
  --linea:        #E4E4E2;   /* sobre claro */
  --linea-osc:    #2A2A2C;   /* sobre oscuro */

  /* estados — el único color del sistema.
     Tonos apagados y terrosos, no semáforo. Solo donde hay que avisar. */
  --alerta:        #A0703C;   /* caduca pronto, última sesión — cobre */
  --alerta-fondo:  #F7F2EA;
  --critico:       #9C4A45;   /* caducado — ladrillo */
  --critico-fondo: #F8EEED;
  --pausa:         #4F6B78;   /* bono congelado — pizarra */
  --pausa-fondo:   #EEF3F5;

  /* geometría */
  --radio:        0;
  --radio-min:    2px;       /* solo etiquetas muy pequeñas */
}
```

**Eliminar por completo:** `--hi`, `--hi-deep`, `--hi-soft` y cualquier
`box-shadow`. Donde había sombra, va una línea de 1 px.

---

## Reglas de forma

```css
/* nada de radios ni sombras */
.bono, .cli, .clase, .ficha, .bloque, .kpi, .btn,
.campo input, .campo textarea, .buscador input, .dlg {
  border-radius: 0;
  box-shadow: none;
}

/* botón principal: rectángulo sólido */
.btn.pri {
  background: var(--tinta);
  color: var(--hueso);
  border: 1px solid var(--tinta);
}
/* sobre fondo oscuro se invierte */
.oscuro .btn.pri {
  background: var(--hueso);
  color: var(--tinta);
  border-color: var(--hueso);
}

/* botón secundario: solo contorno */
.btn {
  background: transparent;
  border: 1px solid var(--linea);
  color: var(--texto);
}

/* etiquetas de sección con numeración */
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11px;
  color: var(--texto-3);
}
.eyebrow .num { margin-right: 8px; }   /* → (01) QUÉ HACEMOS */
```

---

## Reparto claro / oscuro

La web de MOVE alterna las dos, así que no es un compromiso: es su lenguaje.

**Oscuro** (`--tinta`) — la tarjeta del bono del deportista. Es lo que él
mira y enseña. Segmentos gastados en hueso sólido, disponibles en contorno
de 1 px sobre el negro.

**Claro** (`--blanco`) — todo el panel de recepción. Es una herramienta de
trabajo de horas, con listas densas. En claro se lee mejor y cansa menos en
tablet. Segmentos gastados en tinta sólida, disponibles en contorno.

**Oscuro** — pantallas de acceso y registro, y la barra de "Cerrar lista".

---

## El medidor de sesiones

Es el elemento característico y **se mantiene inclinado a −11°**, porque el
logotipo MOVE es oblicuo y ahí es donde la pieza se vuelve de la marca.

```css
.seg {
  transform: skewX(-11deg);
  border-radius: 0;
  border: 1px solid var(--linea);
  background: transparent;
}
.seg.usada { background: var(--tinta); border-color: var(--tinta); }

/* sobre tarjeta oscura */
.oscuro .seg { border-color: var(--linea-osc); }
.oscuro .seg.usada { background: var(--hueso); border-color: var(--hueso); }

/* arrastradas del bono anterior */
.seg.extra { border-style: dashed; }
```

---

## Rejillas con líneas, no con cajas

El patrón de la página de servicios: tarjetas separadas por hairlines dentro
de un contenedor con borde, sin huecos entre ellas.

```css
.rejilla {
  display: grid;
  gap: 0;
  border: 1px solid var(--linea);
}
.rejilla > * {
  border-right: 1px solid var(--linea);
  border-bottom: 1px solid var(--linea);
  margin: 0;
}
```

Aplica a la rejilla de "Pasar lista", a las tarjetas de servicios y a los KPI.

---

## Tipografía

Las mismas dos fuentes que la web. Ambas gratuitas.

```css
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

.bn {
  --display: 'Clash Display', 'Hanken Grotesk', sans-serif;
  --texto-fuente: 'Hanken Grotesk', system-ui, sans-serif;
}
```

**Clash Display, peso 500**, para títulos y cifras grandes. Siempre con
tracking negativo: es lo que le da el carácter.

```css
h1, h2, h3, .cuenta-num, .kpi-n, .marca {
  font-family: var(--display);
  font-weight: 500;
  letter-spacing: -0.02em;   /* imprescindible */
}
.cuenta-num { letter-spacing: -0.035em; }   /* más apretado a tamaños muy grandes */
```

**Hanken Grotesk** para todo lo demás: texto, botones, campos, etiquetas.

**Se elimina JetBrains Mono.** MOVE no usa monoespaciada en ningún sitio:
las etiquetas y la numeración son la misma sans con mucho espaciado entre
letras. Meter una tercera fuente rompería el parecido.

Para que las cifras de fechas y contadores sigan alineando en las listas de
recepción, que es para lo que estaba la monoespaciada:

```css
.dato-val, .cli-rest, .clase-n, .contador-lista, .sub, .log-meta {
  font-family: var(--texto-fuente);
  font-variant-numeric: tabular-nums;
}
```

Las etiquetas pequeñas imitan el patrón `(01) QUÉ HACEMOS` de la web:

```css
.eyebrow {
  font-family: var(--texto-fuente);
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--texto-3);
}
```

---

## Seleccionado se rellena, no se colorea

El sistema es monocromo, así que el estado "marcado" en Pasar lista **no usa
color: invierte**. La ficha pasa a negro sólido con el texto en hueso.

Es el mismo gesto que el medidor —relleno igual a consumido— repetido en otra
escala, y se lee de un vistazo en una rejilla de doce personas.

```css
.ficha {
  background: transparent;
  border: 1px solid var(--linea);
  border-radius: 0;
}
.ficha.marcada {
  background: var(--tinta);
  border-color: var(--tinta);
  color: var(--hueso);
}
.ficha.marcada .ficha-rest { color: var(--texto-inv-2); }
.tick { background: var(--hueso); color: var(--tinta); }
```

Mismo criterio en los filtros ya activos (`.fchip.on`) y en la pestaña
seleccionada: relleno sólido o subrayado, nunca color.

Las etiquetas de aviso dentro de la ficha (`última sesión`, `caduca en N d`)
sí llevan su tono de estado, porque compiten con el resto de información y
tienen que ganar.

---

## Pendiente de confirmar

- **Logotipo MOVE** en la cabecera, en lugar del texto "Centro·Bonos".
  Hace falta el archivo del logo en SVG.
- **Si la web ya tiene sistema de usuarios** (se ve "Iniciar sesión" y un
  carrito en la barra). Si existe, el sistema de bonos debería usar esas
  cuentas y no crear unas nuevas.

*Decidido: sistema monocromo. El color queda reservado a los tres estados
de alerta. Todo lo demás se resuelve con relleno, contorno y líneas.*

