/**
 * Punto de entrada de la aplicación. Solo estado y navegación:
 * las reglas viven en src/dominio y las pantallas en src/componentes.
 */
import React, { useState, useMemo } from 'react';
import './estilos.css';
import { HOY, DIA, SEMANAS_VALIDEZ, SESIONES_BASE, nuevoId, masDias, masSemanas,
  crearBono, totalSesiones, restantes, caducidad, diasParaCaducar, estado,
  bonoVigente, bonoUsable, bonoPendiente, fFecha, fHora, plural, norm } from './dominio/bonos.js';
import { DATOS, clasesIniciales } from './datos/ejemplo.js';
import { Acceso, Registro, Verificar } from './componentes/acceso.jsx';
import { VistaDeportista } from './componentes/deportista.jsx';
import { PasarLista, Clases, Clientes, AltaCliente, Dialogo } from './componentes/recepcion.jsx';

/* ═══════════════════ app ═══════════════════ */

export default function App() {
  const [rol, setRol] = useState("deportista");
  const [subvista, setSubvista] = useState("lista");
  const [clientes, setClientes] = useState(DATOS);
  const [clases, setClases] = useState(() => clasesIniciales(DATOS));
  const [claseActual, setClaseActual] = useState(null);
  const [sesion, setSesion] = useState(null);
  const [pantalla, setPantalla] = useState("acceso");
  const [toast, setToast] = useState(null);
  const [abierto, setAbierto] = useState(null);
  const [dlg, setDlg] = useState(null);
  const [q, setQ] = useState("");
  const [nombrePrevio, setNombrePrevio] = useState("");
  const [hora, setHora] = useState(`${String(HOY.getHours()).padStart(2, "0")}:${String(HOY.getMinutes()).padStart(2, "0")}`);

  const yo = clientes.find((c) => c.id === sesion);
  const avisar = (texto, deshacer = null) => setToast({ texto, deshacer });

  const fechaClase = () => {
    const [h, m] = hora.split(":").map(Number);
    const d = new Date(); d.setHours(h || 0, m || 0, 0, 0); return d.toISOString();
  };

  const anadirConsumo = (cid, fecha) => {
    const id = nuevoId();
    setClientes((prev) => prev.map((c) => {
      if (c.id !== cid) return c;
      const b = bonoUsable(c);
      if (!b) return c;
      return { ...c, bonos: c.bonos.map((x) => x.id === b.id ? { ...x, consumos: [...x.consumos, { id, fecha }] } : x) };
    }));
    return id;
  };
  const claseAbierta = clases.find((k) => k.id === claseActual) || null;
  const marcados = useMemo(() => {
    const m = {};
    (claseAbierta?.asistentes || []).forEach((a) => { m[a.clienteId] = a.consumoId; });
    return m;
  }, [claseAbierta]);

  const quitarConsumo = (cid, xid) => {
    setClientes((prev) => prev.map((c) => c.id !== cid ? c : { ...c, bonos: c.bonos.map((b) => ({ ...b, consumos: b.consumos.filter((x) => x.id !== xid) })) }));
    setClases((prev) => prev.map((k) => ({ ...k, asistentes: k.asistentes.filter((a) => a.consumoId !== xid) })));
  };

  /* marcar en la lista: crea la clase si aún no existe */
  const marcarEnLista = (cid) => {
    const fecha = claseAbierta ? claseAbierta.fecha : fechaClase();
    const consumoId = anadirConsumo(cid, fecha);
    if (claseAbierta) {
      setClases((prev) => prev.map((k) => k.id === claseActual ? { ...k, asistentes: [...k.asistentes, { clienteId: cid, consumoId }] } : k));
    } else {
      const id = nuevoId();
      setClases((prev) => [{ id, fecha, servicio: "Entrenamiento grupal", cerrada: false, asistentes: [{ clienteId: cid, consumoId }] }, ...prev]);
      setClaseActual(id);
    }
  };

  const quitarDeLista = (cid) => quitarConsumo(cid, marcados[cid]);

  const cerrarLista = () => {
    const n = claseAbierta?.asistentes.length || 0;
    const cuando = claseAbierta ? fHora(claseAbierta.fecha) : "";
    setClases((prev) => prev.map((k) => k.id === claseActual ? { ...k, cerrada: true } : k));
    setClaseActual(null);
    setHora(`${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`);
    avisar(`Clase de las ${cuando} cerrada · ${plural(n, "asistente", "asistentes")}`);
  };

  const reabrirClase = (kid) => {
    setClases((prev) => prev.map((k) => k.id === kid ? { ...k, cerrada: false } : k));
    setClaseActual(kid);
    setSubvista("lista");
    avisar("Clase reabierta · puedes añadir o quitar asistentes");
  };

  const quitarAsistente = (kid, cid, xid) => {
    quitarConsumo(cid, xid);
    avisar("Asistente quitado · se le ha devuelto la sesión al bono");
  };

  /* registro público */
  const registrar = ({ nombre, email, clave }) => {
    const existente = clientes.find((c) => norm(c.email) === norm(email));
    const ahora = new Date().toISOString();
    if (existente) {
      setClientes((prev) => prev.map((c) => c.id === existente.id ? { ...c, cuenta: { clave, verificada: false, creada: ahora } } : c));
      setSesion(existente.id);
    } else {
      const id = nuevoId();
      setClientes((prev) => [{ id, nombre, email, telefono: "", alta: ahora, notas: "", avisos: { ultimaSesion: true, caducidad: true }, cuenta: { clave, verificada: false, creada: ahora }, bonos: [] }, ...prev]);
      setSesion(id);
    }
    setPantalla("verifica");
  };

  const verificar = () => {
    setClientes((prev) => prev.map((c) => c.id === sesion ? { ...c, cuenta: { ...c.cuenta, verificada: true } } : c));
    const c = clientes.find((x) => x.id === sesion);
    avisar(bonoVigente(c) ? "Correo confirmado · tu bono ya está enlazado" : "Correo confirmado · cuenta lista");
  };

  const salir = () => { setSesion(null); setPantalla("acceso"); };

  /* recepción */
  const abrirAlta = (n) => { setNombrePrevio(n); setSubvista("alta"); };

  const crearCliente = (d) => {
    const id = nuevoId(), ahora = new Date().toISOString();
    setClientes((prev) => [{ id, nombre: d.nombre, email: d.email, telefono: d.telefono, alta: ahora, notas: d.notas, avisos: d.avisos, cuenta: null, bonos: d.conBono ? [crearBono(ahora)] : [] }, ...prev]);
    setQ(""); setNombrePrevio(""); setSubvista("clientes"); setAbierto(id);
    avisar(d.conBono
      ? `${d.nombre.split(" ")[0]} dado de alta · bono hasta el ${fFecha(masSemanas(ahora, SEMANAS_VALIDEZ))}`
      : `${d.nombre.split(" ")[0]} dado de alta sin bono`);
  };

  const invitar = (cid) => {
    const c = clientes.find((x) => x.id === cid);
    avisar(`Invitación enviada a ${c.email} para que cree su cuenta`);
  };

  const ejecutar = ({ motivo, dias }) => {
    const { tipo, clienteId } = dlg;
    const cliente = clientes.find((c) => c.id === clienteId);
    const nombre = cliente.nombre.split(" ")[0];
    const b = bonoVigente(cliente) || bonoPendiente(cliente);

    if (tipo === "marcar") {
      const id = anadirConsumo(clienteId, new Date().toISOString());
      const q2 = restantes(bonoUsable(cliente)) - 1;
      avisar(`Sesión marcada · ${nombre}, ${q2 === 0 ? "bono completado" : plural(q2, "sesión restante", "sesiones restantes")}`,
        () => { quitarConsumo(clienteId, id); setToast(null); });
    }
    if (tipo === "renovar") {
      const compra = new Date().toISOString();
      const arr = b && ["activo", "congelado"].includes(estado(b)) ? restantes(b) : 0;
      setClientes((prev) => prev.map((c) => {
        if (c.id !== clienteId) return c;
        const cerrados = c.bonos.map((x) => x.id === b?.id ? { ...x, cerrado: true, congelacion: null } : x);
        return { ...c, bonos: [crearBono(compra, { arrastradas: arr }), ...cerrados] };
      }));
      avisar(`Bono activado · ${nombre} tiene ${SESIONES_BASE + arr} sesiones hasta el ${fFecha(masSemanas(compra, SEMANAS_VALIDEZ))}`);
    }
    if (tipo === "congelar") {
      setClientes((prev) => prev.map((c) => c.id !== clienteId ? c : { ...c, bonos: c.bonos.map((x) => x.id === b.id ? { ...x, congelacion: { desde: new Date().toISOString(), motivo } } : x) }));
      avisar(`Bono de ${nombre} en pausa. La caducidad deja de correr.`);
    }
    if (tipo === "reactivar") {
      const parado = Math.max(1, Math.ceil((HOY - new Date(b.congelacion.desde)) / DIA));
      setClientes((prev) => prev.map((c) => c.id !== clienteId ? c : { ...c, bonos: c.bonos.map((x) => x.id === b.id ? { ...x, congelacion: null, ajustes: [...x.ajustes, { id: nuevoId(), tipo: "pausa", dias: parado, motivo: `Pausa recuperada · ${x.congelacion.motivo}`, fecha: new Date().toISOString() }] } : x) }));
      avisar(`${nombre} vuelve a entrenar · +${plural(parado, "día", "días")} de caducidad`);
    }
    if (tipo === "prorroga") {
      setClientes((prev) => prev.map((c) => c.id !== clienteId ? c : { ...c, bonos: c.bonos.map((x) => x.id === b.id ? { ...x, ajustes: [...x.ajustes, { id: nuevoId(), tipo: "prorroga", dias, motivo, fecha: new Date().toISOString() }] } : x) }));
      avisar(`Caducidad de ${nombre} ampliada ${plural(dias, "día", "días")}`);
    }
    setDlg(null);
  };

  const cambiarAviso = (k) => setClientes((prev) => prev.map((c) => c.id !== sesion ? c : { ...c, avisos: { ...c.avisos, [k]: !c.avisos[k] } }));

  const sinSesion = rol === "deportista" && !sesion;
  const sinVerificar = rol === "deportista" && yo && !yo.cuenta?.verificada;

  return (
    <div className="bn">
      <header className="top">
        <div className="marca">Centro<span>·</span>Bonos</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {rol === "deportista" && sesion && <button className="salir" onClick={salir}>Salir</button>}
          <div className="roles">
            <button className={`rol${rol === "deportista" ? " on" : ""}`} onClick={() => setRol("deportista")}>Deportista</button>
            <button className={`rol${rol === "recepcion" ? " on" : ""}`} onClick={() => setRol("recepcion")}>Recepción</button>
          </div>
        </div>
      </header>

      <main className={sinSesion || sinVerificar ? "wrap estrecho" : "wrap"}>
        {rol === "deportista" ? (
          sinSesion ? (
            pantalla === "registro"
              ? <Registro clientes={clientes} onCrear={registrar} onIrAcceso={() => setPantalla("acceso")} />
              : <Acceso clientes={clientes} onEntrar={(id) => setSesion(id)} onIrRegistro={() => setPantalla("registro")} />
          ) : sinVerificar ? (
            <Verificar cliente={yo} onVerificar={verificar} onSalir={salir} />
          ) : (
            <>
              <div className="aviso-proto">
                <b>Sesión iniciada como {yo.nombre}.</b> En la web real esto sería una página más del sitio, junto a Clases y el resto.
              </div>
              <VistaDeportista cliente={yo} onAviso={cambiarAviso} />
            </>
          )
        ) : subvista === "alta" ? (
          <AltaCliente clientes={clientes} nombrePrevio={nombrePrevio} onGuardar={crearCliente} onCancelar={() => { setNombrePrevio(""); setSubvista("clientes"); }} />
        ) : (
          <>
            <div className="tabs" style={{ marginTop: 0 }}>
              <button className={`tab${subvista === "lista" ? " on" : ""}`} onClick={() => setSubvista("lista")}>
                Pasar lista{claseAbierta && <span className="tab-c">●</span>}
              </button>
              <button className={`tab${subvista === "clases" ? " on" : ""}`} onClick={() => setSubvista("clases")}>
                Clases<span className="tab-c">{clases.length}</span>
              </button>
              <button className={`tab${subvista === "clientes" ? " on" : ""}`} onClick={() => setSubvista("clientes")}>Clientes y bonos</button>
            </div>
            {subvista === "lista" ? (
              <PasarLista clientes={clientes} marcados={marcados} hora={hora} setHora={setHora}
                claseAbierta={claseAbierta} onCerrar={cerrarLista}
                onMarcar={marcarEnLista} onQuitar={quitarDeLista}
                onIrAFicha={(id) => { setSubvista("clientes"); setAbierto(id); }} />
            ) : subvista === "clases" ? (
              <Clases clases={clases} clientes={clientes} onQuitarAsistente={quitarAsistente} onReabrir={reabrirClase}
                onIrAFicha={(id) => { setSubvista("clientes"); setAbierto(id); }} />
            ) : (
              <Clientes clientes={clientes} abierto={abierto} setAbierto={setAbierto} q={q} setQ={setQ} onInvitar={invitar}
                onAnular={(cid, bid, xid) => { quitarConsumo(cid, xid); avisar("Sesión anulada. Vuelve a contar como disponible."); }}
                onDialogo={setDlg} onAlta={abrirAlta} />
            )}
          </>
        )}
      </main>

      {dlg && <Dialogo dlg={dlg} cliente={clientes.find((c) => c.id === dlg.clienteId)} onCerrar={() => setDlg(null)} onConfirmar={ejecutar} />}

      {toast && (
        <div className="toast" role="status">
          <b>{toast.texto}</b>
          {toast.deshacer ? <button onClick={toast.deshacer}>Deshacer</button> : <button onClick={() => setToast(null)}>Cerrar</button>}
        </div>
      )}
    </div>
  );
}
