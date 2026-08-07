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
