/**
 * Datos de ejemplo del prototipo. Se sustituyen por la base de datos real.
 * Están aislados aquí precisamente para que borrarlos sea trivial.
 */
import { hace, crearBono, cons, claveClase, nuevoId } from '../dominio/bonos.js';

/* ═══════════════════ datos de ejemplo ═══════════════════ */

export const DATOS = [
  { id: "c1", nombre: "Marta Ribas", email: "marta.ribas@correo.com", telefono: "612 44 88 01",
    alta: hace(130, 10), notas: "", avisos: { ultimaSesion: true, caducidad: true },
    cuenta: { clave: "entreno2026", verificada: true, creada: hace(129, 12) },
    bonos: [
      crearBono(hace(41, 10), { arrastradas: 2, consumos: cons([38, 19], [34, 19], [31, 8, 30], [24, 19], [17, 19], [10, 8, 30], [3, 19]) }),
      crearBono(hace(130, 10), { cerrado: true, consumos: cons([128, 19], [124, 19], [120, 19], [116, 8, 30], [112, 19], [108, 19], [104, 19], [99, 19]) }),
    ] },
  { id: "c2", nombre: "Iker Solans", email: "iker.solans@correo.com", telefono: "677 21 03 55",
    alta: hace(70, 10), notas: "", avisos: { ultimaSesion: true, caducidad: false }, cuenta: null,
    bonos: [crearBono(hace(70, 10), { consumos: cons([66, 19], [62, 19], [58, 8, 30], [51, 19], [44, 19], [37, 19], [28, 8, 30], [19, 19], [6, 19]) })] },
  { id: "c3", nombre: "Nadia Fort", email: "nadia.fort@correo.com", telefono: "630 90 12 74",
    alta: hace(78, 10), notas: "", avisos: { ultimaSesion: true, caducidad: true },
    cuenta: { clave: "nadia1234", verificada: true, creada: hace(77, 12) },
    bonos: [crearBono(hace(78, 10), { consumos: cons([74, 19], [60, 19], [40, 8, 30], [12, 19]) })] },
  { id: "c4", nombre: "Pau Estany", email: "pau.estany@correo.com", telefono: "699 55 41 20",
    alta: hace(5, 10), notas: "", avisos: { ultimaSesion: false, caducidad: true }, cuenta: null,
    bonos: [crearBono(hace(5, 10), { consumos: cons([2, 19]) })] },
  { id: "c5", nombre: "Elsa Moix", email: "elsa.moix@correo.com", telefono: "654 12 77 39",
    alta: hace(50, 10), notas: "Prefiere el turno de mañana.", avisos: { ultimaSesion: true, caducidad: true },
    cuenta: { clave: "elsamoix01", verificada: true, creada: hace(49, 12) },
    bonos: [crearBono(hace(50, 10), {
      congelacion: { desde: hace(20, 12), motivo: "Lesión de rodilla · parte médico entregado" },
      consumos: cons([46, 19], [40, 19], [33, 8, 30], [26, 19]) })] },
  { id: "c6", nombre: "Bruno Cela", email: "bruno.cela@correo.com", telefono: "688 30 55 12",
    alta: hace(100, 10), notas: "", avisos: { ultimaSesion: true, caducidad: true }, cuenta: null,
    bonos: [crearBono(hace(100, 10), { consumos: cons([96, 19], [88, 19], [77, 8, 30], [60, 19], [45, 19]) })] },
  { id: "c7", nombre: "Lucía Núñez", email: "lucia.nunez@correo.com", telefono: "645 88 21 30",
    alta: hace(30, 10), notas: "", avisos: { ultimaSesion: true, caducidad: true },
    cuenta: { clave: "lucia12345", verificada: true, creada: hace(29, 12) },
    bonos: [crearBono(hace(30, 10), { consumos: cons([27, 19], [20, 19], [13, 8, 30], [3, 19]) })] },
  { id: "c8", nombre: "Òscar Prats", email: "oscar.prats@correo.com", telefono: "611 07 44 92",
    alta: hace(22, 10), notas: "", avisos: { ultimaSesion: true, caducidad: true }, cuenta: null,
    bonos: [crearBono(hace(22, 10), { consumos: cons([17, 19], [10, 8, 30], [3, 19]) })] },
  { id: "c9", nombre: "Iria Benítez", email: "iria.benitez@correo.com", telefono: "622 51 63 08",
    alta: hace(60, 10), notas: "", avisos: { ultimaSesion: true, caducidad: true },
    cuenta: { clave: "iriabenitez", verificada: true, creada: hace(59, 12) },
    bonos: [crearBono(hace(60, 10), { consumos: cons([55, 19], [48, 19], [41, 8, 30], [24, 19], [17, 19], [10, 8, 30]) })] },
  { id: "c10", nombre: "Marc Duran", email: "marc.duran@correo.com", telefono: "667 12 90 44",
    alta: hace(14, 10), notas: "", avisos: { ultimaSesion: true, caducidad: true }, cuenta: null,
    bonos: [crearBono(hace(14, 10), { consumos: cons([10, 8, 30], [3, 19]) })] },
  { id: "c11", nombre: "Sofía Aguilar", email: "sofia.aguilar@correo.com", telefono: "635 74 12 55",
    alta: hace(46, 10), notas: "", avisos: { ultimaSesion: true, caducidad: true },
    cuenta: { clave: "sofiaaguilar", verificada: true, creada: hace(45, 12) },
    bonos: [crearBono(hace(46, 10), { consumos: cons([41, 8, 30], [31, 19], [24, 19], [17, 19], [10, 8, 30]) })] },
  { id: "c12", nombre: "Héctor Vila", email: "hector.vila@correo.com", telefono: "649 33 87 21",
    alta: hace(9, 10), notas: "", avisos: { ultimaSesion: true, caducidad: true }, cuenta: null,
    bonos: [crearBono(hace(9, 10), { consumos: cons([3, 19]) })] },
];

/* Reconstruye el historial de clases agrupando los consumos por día y hora.
   En producción esto no haría falta: la clase se crea al marcar al primero. */
export const clasesIniciales = (clientes) => {
  const mapa = new Map();
  clientes.forEach((c) =>
    c.bonos.forEach((b) =>
      b.consumos.forEach((x) => {
        const k = claveClase(x.fecha);
        if (!mapa.has(k)) mapa.set(k, { id: nuevoId(), fecha: x.fecha, servicio: "Entrenamiento grupal", cerrada: true, asistentes: [] });
        mapa.get(k).asistentes.push({ clienteId: c.id, consumoId: x.id });
      })
    )
  );
  return [...mapa.values()].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};

export const CLAVES_DEBILES = ["12345678", "123456789", "contraseña", "password", "qwertyui", "11111111", "gimnasio", "entrenar"];
