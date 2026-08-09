/**
 * Reglas de negocio de los bonos. Sin React ni interfaz: solo lógica pura.
 * Todo lo que decide si un bono vale, cuánto queda o cuándo caduca vive aquí,
 * para poder probarlo por separado y no duplicarlo en cada pantalla.
 */

export const HOY = new Date();
export const DIA = 86400000;
export const SEMANAS_VALIDEZ = 12;
export const SESIONES_BASE = 10;

let _id = 100;
export const nuevoId = () => `x${_id++}`;

export const hace = (n, h = 19, m = 0) => {
  const d = new Date(HOY.getTime() - n * DIA);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
export const masDias = (iso, d) => new Date(new Date(iso).getTime() + d * DIA).toISOString();
export const masSemanas = (iso, s) => masDias(iso, s * 7);

export const crearBono = (fechaCompra, extra = {}) => ({
  id: nuevoId(), servicio: "Entrenamiento grupal",
  sesionesBase: SESIONES_BASE, arrastradas: 0,
  fechaCompra, fechaCaducidadBase: masSemanas(fechaCompra, SEMANAS_VALIDEZ),
  consumos: [], ajustes: [], congelacion: null, cerrado: false, ...extra,
});
export const cons = (...a) => a.map(([d, h, m]) => ({ id: nuevoId(), fecha: hace(d, h, m) }));

/* ─── derivados ─── */
export const totalSesiones = (b) => b.sesionesBase + b.arrastradas;
export const usadas = (b) => b.consumos.length;
export const restantes = (b) => totalSesiones(b) - usadas(b);
export const caducidad = (b) => masDias(b.fechaCaducidadBase, b.ajustes.reduce((s, a) => s + a.dias, 0));
export const diasParaCaducar = (b) => Math.ceil((new Date(caducidad(b)) - HOY) / DIA);
export const estado = (b) => {
  if (b.cerrado) return "renovado";
  if (b.congelacion) return "congelado";
  if (usadas(b) >= totalSesiones(b)) return "agotado";
  if (new Date(caducidad(b)) < HOY) return "caducado";
  return "activo";
};
export const bonoVigente = (c) => c.bonos.find((b) => ["activo", "congelado"].includes(estado(b)));
export const bonoUsable = (c) => c.bonos.find((b) => estado(b) === "activo" && restantes(b) > 0);
export const bonoPendiente = (c) => c.bonos.find((b) => ["activo", "congelado", "caducado", "agotado"].includes(estado(b)));
export const bonosPasados = (c) => c.bonos.filter((b) => !["activo", "congelado"].includes(estado(b)));
export const ordenados = (b) => [...b.consumos].sort((a, c) => new Date(a.fecha) - new Date(c.fecha));

/* ─── operaciones ───
   Cada una recibe el bono tal cual está y devuelve la pieza nueva, sin
   tocar clientes ni clases: eso es cableado de App.jsx, no una regla. */

/* renovar: si el bono anterior sigue vivo (activo o congelado), sus sesiones
   sin usar se arrastran; si está caducado o agotado, no se arrastra nada */
export const renovarBono = (bonoAnterior, fechaCompra) => {
  const arrastradas = bonoAnterior && ["activo", "congelado"].includes(estado(bonoAnterior)) ? restantes(bonoAnterior) : 0;
  const bonoCerrado = bonoAnterior ? { ...bonoAnterior, cerrado: true, congelacion: null } : null;
  return { bonoNuevo: crearBono(fechaCompra, { arrastradas }), bonoCerrado, arrastradas };
};

/* reactivar: los días que ha estado en pausa se suman a la caducidad como
   un ajuste más, igual que una prórroga */
export const reactivarBono = (bono) => {
  const dias = Math.max(1, Math.ceil((HOY - new Date(bono.congelacion.desde)) / DIA));
  return {
    dias,
    bono: {
      ...bono, congelacion: null,
      ajustes: [...bono.ajustes, { id: nuevoId(), tipo: "pausa", dias, motivo: `Pausa recuperada · ${bono.congelacion.motivo}`, fecha: new Date().toISOString() }],
    },
  };
};

/* prórroga: motivo justificado ya validado por quien llama */
export const prorrogarBono = (bono, dias, motivo) => ({
  ...bono,
  ajustes: [...bono.ajustes, { id: nuevoId(), tipo: "prorroga", dias, motivo, fecha: new Date().toISOString() }],
});

/* anular una sesión: la quita de cualquier bono del cliente que la tenga,
   así vuelve a contar en el saldo disponible */
export const anularConsumo = (cliente, consumoId) => ({
  ...cliente,
  bonos: cliente.bonos.map((b) => ({ ...b, consumos: b.consumos.filter((x) => x.id !== consumoId) })),
});

/* ─── formato ─── */
export const fFecha = (i) => new Date(i).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
export const fCorta = (i) => new Date(i).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
export const fHora = (i) => new Date(i).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
export const fDia = (i) => new Date(i).toLocaleDateString("es-ES", { weekday: "short" });
export const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;
export const norm = (s) => (s || "").toLowerCase().replace(/\s+/g, "").trim();

/* quita tildes/diéresis: "nunez" encuentra a "Núñez", "oscar" a "Òscar" */
export const sinTildes = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export const coincide = (c, q) => {
  const t = sinTildes(q).trim();
  if (!t) return true;
  return sinTildes(`${c.nombre} ${c.email} ${c.telefono}`).includes(t)
    || (c.telefono || "").replace(/\s+/g, "").includes(t.replace(/\s+/g, ""));
};

/* clave de agrupación de una clase: mismo día y misma hora */
export const claveClase = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}`;
};
export const fClase = (iso) => {
  const d = new Date(iso);
  const hoy = d.toDateString() === HOY.toDateString();
  const ayer = d.toDateString() === new Date(HOY.getTime() - DIA).toDateString();
  const dia = hoy ? "Hoy" : ayer ? "Ayer"
    : d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  return `${dia} · ${fHora(iso)}`;
};
