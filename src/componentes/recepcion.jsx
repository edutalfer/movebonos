/** El puesto de recepción: pasar lista, historial de clases, fichas y altas. */
import React, { useState, useMemo } from 'react';
import { HOY, DIA, SEMANAS_VALIDEZ, SESIONES_BASE, nuevoId, hace, masDias, masSemanas,
  crearBono, totalSesiones, usadas, restantes, caducidad, diasParaCaducar, estado,
  bonoVigente, bonoUsable, bonoPendiente, bonosPasados, ordenados,
  fFecha, fCorta, fHora, fDia, plural, norm, sinTildes, coincide, claveClase, fClase } from '../dominio/bonos.js';
import { Medidor, Chip, Check } from './comunes.jsx';

/* ═══════════════════ pasar lista ═══════════════════ */

export function PasarLista({ clientes, onMarcar, onQuitar, onCerrar, marcados, hora, setHora, onIrAFicha, claseAbierta }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const disp = clientes.filter((c) => bonoUsable(c));
  const n = Object.keys(marcados).length;
  const nSin = disp.length - n;
  const buscando = busca.trim().length > 0;

  const visibles = disp.filter((c) => {
    if (!coincide(c, busca)) return false;
    if (filtro === "marcados") return !!marcados[c.id];
    if (filtro === "sinmarcar") return !marcados[c.id];
    return true;
  });

  const bloqTodos = clientes.filter((c) => !bonoUsable(c));
  const bloq = bloqTodos.filter((c) => coincide(c, busca));

  return (
    <>
      <div className="lista-cab">
        <div><span className="eyebrow">Pasar lista</span>
          <h3 style={{ marginTop: 5 }}>{HOY.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</h3></div>
        <input className="hora-in" type="time" value={hora} onChange={(e) => setHora(e.target.value)} aria-label="Hora de la clase" />
        <span className="contador-lista">{n} {n === 1 ? "asistente" : "asistentes"}</span>
      </div>

      <div className="buscador">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nombre o teléfono" aria-label="Buscar deportista" />
        {busca && <button className="borrar" onClick={() => setBusca("")} aria-label="Borrar búsqueda">✕</button>}
      </div>

      <div className="filtros">
        <button className={`fchip${filtro === "todos" ? " on" : ""}`} onClick={() => setFiltro("todos")}>Todos<b>{disp.length}</b></button>
        <button className={`fchip${filtro === "sinmarcar" ? " on" : ""}`} onClick={() => setFiltro("sinmarcar")}>Sin marcar<b>{nSin}</b></button>
        <button className={`fchip${filtro === "marcados" ? " on" : ""}`} onClick={() => setFiltro("marcados")}>Marcados<b>{n}</b></button>
        {(buscando || filtro !== "todos") && <span className="recuento">Mostrando {visibles.length} de {disp.length}</span>}
      </div>

      {disp.length === 0 ? (
        <div className="vacio"><strong>Nadie tiene sesiones disponibles</strong>Renueva bonos desde Clientes.</div>
      ) : visibles.length === 0 ? (
        <div className="sin-resultado">
          {filtro === "marcados" && !buscando ? (
            <><strong>Todavía no has marcado a nadie</strong>Toca a cada deportista que haya venido.</>
          ) : filtro === "sinmarcar" && !buscando ? (
            <><strong>Ya están todos marcados</strong>No queda nadie pendiente en la lista de hoy.</>
          ) : bloq.length > 0 ? (
            <><strong>“{busca}” no puede entrenar hoy</strong>Aparece abajo, con el motivo y el acceso a su ficha.</>
          ) : (
            <><strong>Nadie coincide con “{busca}”</strong>Prueba con el apellido, o búscalo en Clientes y bonos por si aún no está dado de alta.</>
          )}
        </div>
      ) : (
        <div className="rejilla">
          {visibles.map((c) => {
            const b = bonoUsable(c), marcado = !!marcados[c.id], q = restantes(b);
            return (
              <button key={c.id} className={`ficha${marcado ? " marcada" : ""}`} onClick={() => marcado ? onQuitar(c.id) : onMarcar(c.id)} aria-pressed={marcado}>
                <div className="ficha-nom">{marcado && <span className="tick">✓</span>}{c.nombre}</div>
                <div className="ficha-rest">{marcado ? `Marcada · quedan ${q}` : `${q}/${totalSesiones(b)} disponibles`}</div>
                {!marcado && q <= 1 && <span className="ficha-avisin">Última sesión</span>}
                {!marcado && q > 1 && diasParaCaducar(b) <= 7 && <span className="ficha-avisin">Caduca en {diasParaCaducar(b)} d</span>}
              </button>
            );
          })}
        </div>
      )}

      {claseAbierta && (
        <div className="cerrar-barra">
          <div>
            <div className="t">Clase en curso · {fHora(claseAbierta.fecha)}</div>
            <div className="d">{n} {n === 1 ? "asistente marcado" : "asistentes marcados"} · ya está todo guardado</div>
          </div>
          <button className="btn pri" onClick={onCerrar}>Cerrar lista</button>
        </div>
      )}

      {bloqTodos.length > 0 && (
        <div className="bloqueados">
          <span className="eyebrow" style={{ display: "block", marginBottom: 10 }}>
            No pueden entrenar hoy{buscando && bloq.length !== bloqTodos.length ? ` · ${bloq.length} de ${bloqTodos.length}` : ""}
          </span>
          {bloq.length === 0 && <div className="sub" style={{ marginTop: 0 }}>Ninguno coincide con la búsqueda.</div>}
          {bloq.map((c) => {
            const b = bonoPendiente(c), e = b ? estado(b) : null;
            const motivo = e === "congelado" ? `Bono en pausa · ${b.congelacion.motivo}`
              : e === "caducado" ? `Bono caducado el ${fCorta(caducidad(b))}${restantes(b) > 0 ? ` con ${restantes(b)} sin usar` : ""}`
              : e === "agotado" ? "Bono completado" : "Sin bono";
            return (
              <div className="bloq" key={c.id}>
                <div><div className="bloq-nom">{c.nombre}</div><div className="sub">{motivo}</div></div>
                <button className="btn mini" style={{ marginLeft: "auto" }} onClick={() => onIrAFicha(c.id)}>Abrir ficha</button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ═══════════════════ CLASES ═══════════════════ */

export function Clases({ clases, clientes, onQuitarAsistente, onReabrir, onIrAFicha }) {
  const [abierta, setAbierta] = useState(null);
  const nombre = (id) => clientes.find((c) => c.id === id)?.nombre || "Cliente eliminado";

  const porDia = useMemo(() => {
    let s = 0, c7 = 0;
    const limite = HOY.getTime() - 7 * DIA;
    clases.forEach((k) => { s += k.asistentes.length; if (new Date(k.fecha).getTime() >= limite) c7 += k.asistentes.length; });
    const media = clases.length ? (s / clases.length).toFixed(1) : "0";
    return { total: clases.length, media, c7 };
  }, [clases]);

  if (clases.length === 0) {
    return <div className="vacio"><strong>Todavía no hay ninguna clase registrada</strong>En cuanto marques al primer asistente en Pasar lista, la clase aparecerá aquí.</div>;
  }

  return (
    <>
      <div className="panel" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="kpi"><div className="kpi-n">{porDia.total}</div><span className="eyebrow">Clases registradas</span></div>
        <div className="kpi"><div className="kpi-n">{porDia.c7}</div><span className="eyebrow">Asistencias 7 días</span></div>
        <div className="kpi"><div className="kpi-n">{porDia.media}</div><span className="eyebrow">Media por clase</span></div>
      </div>

      {clases.map((k) => {
        const open = abierta === k.id;
        const n = k.asistentes.length;
        return (
          <div className={`clase${!k.cerrada ? " viva" : ""}`} key={k.id}>
            <div className="clase-cab">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="clase-t">{fClase(k.fecha)}{!k.cerrada && <span className="chip ok">En curso</span>}</div>
                <div className="sub">{k.servicio}</div>
              </div>
              <span className={`clase-n${n === 0 ? " cero" : ""}`}>{n} {n === 1 ? "asist." : "asist."}</span>
              <button className="ver-ficha" onClick={() => setAbierta(open ? null : k.id)} aria-expanded={open}>
                {open ? "Cerrar" : "Ver quién vino"}
              </button>
            </div>

            {open && (
              <div className="clase-cuerpo">
                {n === 0 ? (
                  <div className="sub" style={{ marginTop: 0, marginBottom: 14 }}>Nadie asistió a esta clase.</div>
                ) : (
                  <div className="asis">
                    {k.asistentes.map((a) => (
                      <div className="asis-f" key={a.consumoId}>
                        <span className="log-n">✓</span>
                        <span className="asis-n">{nombre(a.clienteId)}</span>
                        <button className="btn mini" style={{ marginLeft: "auto" }} onClick={() => onIrAFicha(a.clienteId)}>Ficha</button>
                        <button className="btn mini peligro" onClick={() => onQuitarAsistente(k.id, a.clienteId, a.consumoId)}>Quitar</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="sub" style={{ marginTop: 0, marginBottom: 14 }}>
                  Al quitar a alguien se le devuelve la sesión a su bono.
                </div>
                {k.cerrada && <button className="btn" onClick={() => onReabrir(k.id)}>Reabrir para añadir a alguien</button>}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ═══════════════════ clientes ═══════════════════ */

export function Clientes({ clientes, abierto, setAbierto, onAnular, onDialogo, onAlta, onInvitar, q, setQ }) {
  const kpis = useMemo(() => {
    let activos = 0, hoy = 0, porCaducar = 0, casi = 0, sinCuenta = 0;
    clientes.forEach((c) => {
      if (!c.cuenta) sinCuenta++;
      const b = bonoVigente(c);
      if (!b || estado(b) === "congelado") return;
      activos++;
      if (diasParaCaducar(b) <= 7) porCaducar++;
      if (restantes(b) <= 1) casi++;
      b.consumos.forEach((x) => { if (new Date(x.fecha).toDateString() === HOY.toDateString()) hoy++; });
    });
    return { activos, hoy, porCaducar, casi, sinCuenta };
  }, [clientes]);

  const filtrados = clientes.filter((c) => coincide(c, q));

  return (
    <>
      <div className="panel">
        <div className="kpi"><div className="kpi-n">{kpis.activos}</div><span className="eyebrow">Bonos activos</span></div>
        <div className="kpi"><div className="kpi-n">{kpis.hoy}</div><span className="eyebrow">Sesiones hoy</span></div>
        <div className="kpi"><div className={`kpi-n${kpis.porCaducar ? " al" : ""}`}>{kpis.porCaducar}</div><span className="eyebrow">Caducan esta semana</span></div>
        <div className="kpi"><div className={`kpi-n${kpis.sinCuenta ? " al" : ""}`}>{kpis.sinCuenta}</div><span className="eyebrow">Sin cuenta web</span></div>
      </div>

      <div className="barra-buscar">
        <input className="buscar" placeholder="Buscar por nombre, correo o teléfono" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn oscuro" onClick={() => onAlta("")}>+ Nuevo deportista</button>
      </div>

      {filtrados.length === 0 && (
        <div className="vacio">
          <strong>Nadie coincide con “{q}”</strong>
          Si es la primera vez que viene, dale de alta ahora.
          <div style={{ marginTop: 16 }}><button className="btn pri" onClick={() => onAlta(q.trim())}>Dar de alta a “{q.trim()}”</button></div>
        </div>
      )}

      {filtrados.map((c) => {
        const b = bonoVigente(c) || bonoPendiente(c);
        const open = abierto === c.id, e = b ? estado(b) : null;
        const puedeMarcar = e === "activo" && restantes(b) > 0;
        return (
          <div className={`cli${open ? " abierto" : ""}`} key={c.id}>
            <div className="cli-cab">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="cli-nom">{c.nombre}{!c.cuenta && <span className="chip off">Sin cuenta</span>}</div>
                <div className="sub">
                  {!b ? "Sin bono" : e === "congelado" ? "En pausa" : e === "caducado" ? `Caducó ${fCorta(caducidad(b))}`
                    : e === "agotado" ? "Bono completado" : `Caduca ${fCorta(caducidad(b))} · ${diasParaCaducar(b)} d`}
                </div>
              </div>
              {b && <div className="cli-med"><Medidor b={b} mini apagado={e !== "activo"} /></div>}
              <div className="cli-rest">{b ? `${restantes(b)}/${totalSesiones(b)}` : "—"}</div>
              <button className="ver-ficha" onClick={() => setAbierto(open ? null : c.id)} aria-expanded={open}>{open ? "Cerrar" : "Ver ficha"}</button>
            </div>

            {open && (
              <div className="cli-cuerpo">
                <div className="contacto">
                  {c.email}{c.telefono ? ` · ${c.telefono}` : ""}<br />
                  Alta el {fFecha(c.alta)} · {c.cuenta ? `cuenta web creada el ${fFecha(c.cuenta.creada)}` : "sin cuenta web"}
                </div>
                {c.notas && <div className="nota-int">{c.notas}</div>}

                <div className="acciones">
                  <button className="btn pri" disabled={!puedeMarcar} onClick={() => onDialogo({ tipo: "marcar", clienteId: c.id })}>Marcar sesión suelta</button>
                  <button className="btn oscuro" onClick={() => onDialogo({ tipo: "renovar", clienteId: c.id })}>
                    {b && ["activo", "congelado"].includes(e) ? "Renovar bono" : "Vender bono nuevo"}
                  </button>
                  {b && e === "congelado" ? <button className="btn" onClick={() => onDialogo({ tipo: "reactivar", clienteId: c.id })}>Reactivar bono</button>
                    : b && ["activo", "caducado"].includes(e) ? <button className="btn" onClick={() => onDialogo({ tipo: "congelar", clienteId: c.id })}>Poner en pausa</button> : null}
                  {b && ["activo", "caducado", "congelado"].includes(e) && <button className="btn" onClick={() => onDialogo({ tipo: "prorroga", clienteId: c.id })}>Ampliar caducidad</button>}
                  {!c.cuenta && <button className="btn" onClick={() => onInvitar(c.id)}>Invitar a crear cuenta</button>}
                </div>

                {b ? (
                  <>
                    {b.ajustes.length > 0 && (
                      <>
                        <span className="eyebrow" style={{ display: "block", marginBottom: 9 }}>Cambios sobre la caducidad</span>
                        {b.ajustes.map((a) => (
                          <div className="ajuste-l" key={a.id}>
                            <b>{a.tipo === "prorroga" ? "Prórroga" : "Pausa recuperada"} · +{plural(a.dias, "día", "días")}</b>
                            <br /><span>{fFecha(a.fecha)} — {a.motivo}</span>
                          </div>
                        ))}
                        <div style={{ height: 16 }} />
                      </>
                    )}
                    <span className="eyebrow" style={{ display: "block", marginBottom: 9 }}>Sesiones del bono · anula si te has equivocado</span>
                    {b.consumos.length === 0 ? <div className="sub">Todavía sin sesiones marcadas.</div> : (
                      <div className="anular">
                        {[...ordenados(b)].reverse().map((x, i) => (
                          <div className="anular-f" key={x.id}>
                            <span className="log-n">{b.consumos.length - i}</span>
                            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{fFecha(x.fecha)}</span>
                            <span className="log-meta">{fHora(x.fecha)}</span>
                            <button className="btn mini peligro" onClick={() => onAnular(c.id, b.id, x.id)}>Anular</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : <div className="sub">{c.nombre.split(" ")[0]} todavía no tiene ningún bono.</div>}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ═══════════════════ alta desde recepción ═══════════════════ */

export function AltaCliente({ clientes, nombrePrevio, onGuardar, onCancelar }) {
  const [f, setF] = useState({ nombre: nombrePrevio || "", email: "", telefono: "", notas: "", conBono: true, avisoUltima: true, avisoCaducidad: true, consentimiento: false });
  const [tocado, setTocado] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim());
  const emailRep = clientes.some((c) => norm(c.email) === norm(f.email));
  const telRep = f.telefono.trim() && clientes.some((c) => norm(c.telefono) === norm(f.telefono));
  const nomRep = clientes.some((c) => norm(c.nombre) === norm(f.nombre));

  const err = {
    nombre: f.nombre.trim().length < 3 ? "Escribe nombre y apellidos." : null,
    email: !f.email.trim() ? "Hace falta un correo para poder avisarle."
      : !emailOk ? "Este correo no tiene un formato válido." : emailRep ? "Ya hay un cliente con este correo." : null,
    consentimiento: !f.consentimiento ? "Falta el consentimiento de datos." : null,
  };
  const hayErr = Object.values(err).some(Boolean);
  const m = (k) => tocado && err[k];
  const previo = useMemo(() => crearBono(new Date().toISOString()), []);

  const guardar = () => {
    setTocado(true);
    if (hayErr) return;
    onGuardar({ nombre: f.nombre.trim(), email: f.email.trim().toLowerCase(), telefono: f.telefono.trim(), notas: f.notas.trim(), conBono: f.conBono, avisos: { ultimaSesion: f.avisoUltima, caducidad: f.avisoCaducidad } });
  };

  return (
    <>
      <div className="alta-cab">
        <span className="eyebrow">Recepción · alta</span>
        <h2>Nuevo deportista</h2>
        <p>Con el nombre y el correo ya puedes darle de alta. Podrá crear su cuenta web después con ese mismo correo y su bono aparecerá solo.</p>
      </div>

      <div className="bloque">
        <span className="eyebrow">Datos de contacto</span>
        <div className="rejilla2">
          <label className={`campo${m("nombre") ? " mal" : ""}`}>
            <span className="eyebrow">Nombre y apellidos</span>
            <input value={f.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Marta Ribas" autoFocus />
            {m("nombre") ? <div className="pista mal">{err.nombre}</div> : nomRep && f.nombre.trim().length > 2 ? <div className="pista">Ya existe alguien con este nombre. Comprueba que no sea la misma persona.</div> : null}
          </label>
          <label className={`campo${m("email") ? " mal" : ""}`}>
            <span className="eyebrow">Correo electrónico</span>
            <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="marta.ribas@correo.com" />
            {m("email") ? <div className="pista mal">{err.email}</div> : <div className="pista">Es la llave que une su ficha con su cuenta web. Confírmalo con él.</div>}
          </label>
          <label className="campo">
            <span className="eyebrow">Teléfono (opcional)</span>
            <input value={f.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="612 44 88 01" />
            {telRep && <div className="pista">Este teléfono ya está en otra ficha.</div>}
          </label>
          <label className="campo">
            <span className="eyebrow">Notas de recepción (opcional)</span>
            <input value={f.notas} onChange={(e) => set("notas", e.target.value)} placeholder="Prefiere el turno de mañana" />
            <div className="pista">Solo la ve recepción, nunca el deportista.</div>
          </label>
        </div>
      </div>

      <div className={f.conBono ? "previo" : "bloque"}>
        <span className="eyebrow">Bono inicial</span>
        <Check on={f.conBono} onClick={() => set("conBono", !f.conBono)} titulo={`Activar hoy un bono de ${SESIONES_BASE} sesiones`}
          desc={f.conBono ? null : "Se dará de alta sin bono. Podrás vendérselo más tarde desde su ficha."} />
        {f.conBono && (
          <>
            <h4>Entrenamiento grupal</h4>
            <Medidor b={previo} />
            <div className="previo-pie">
              <div className="dato"><span className="eyebrow">Sesiones</span><span className="dato-val">{SESIONES_BASE} sin usar</span></div>
              <div className="dato"><span className="eyebrow">Válido hasta</span><span className="dato-val">{fFecha(caducidad(previo))}</span></div>
              <div className="dato"><span className="eyebrow">Duración</span><span className="dato-val">{SEMANAS_VALIDEZ} semanas</span></div>
            </div>
          </>
        )}
      </div>

      <div className="bloque">
        <span className="eyebrow">Avisos por correo</span>
        <Check on={f.avisoUltima} onClick={() => set("avisoUltima", !f.avisoUltima)} titulo="Cuando le quede una sesión" desc="Para que pueda renovar antes de quedarse a cero." />
        <Check on={f.avisoCaducidad} onClick={() => set("avisoCaducidad", !f.avisoCaducidad)} titulo="Una semana antes de caducar" desc="Aviso 7 días antes de la fecha límite." />
      </div>

      <div className="bloque">
        <span className="eyebrow">Protección de datos</span>
        <Check on={f.consentimiento} onClick={() => set("consentimiento", !f.consentimiento)} mal={m("consentimiento")}
          titulo="Le he informado y ha dado su consentimiento"
          desc="Guardamos nombre, correo, teléfono y su historial de asistencia para gestionar el bono. Puede pedir acceso o borrado cuando quiera." />
      </div>

      {tocado && hayErr && <div className="alerta-caja mal">Falta algo por completar: {Object.values(err).filter(Boolean).join(" ")}</div>}

      <div className="pie-alta">
        <button className="btn grande" onClick={onCancelar}>Cancelar</button>
        <button className="btn pri grande" onClick={guardar}>{f.conBono ? "Dar de alta y activar bono" : "Dar de alta"}</button>
      </div>
    </>
  );
}

/* ═══════════════════ diálogos ═══════════════════ */

export function Dialogo({ dlg, cliente, onCerrar, onConfirmar }) {
  const [motivo, setMotivo] = useState("");
  const [dias, setDias] = useState("14");
  const [error, setError] = useState("");
  const b = bonoVigente(cliente) || bonoPendiente(cliente);
  const nombre = cliente.nombre.split(" ")[0];
  const pedir = ["congelar", "prorroga"].includes(dlg.tipo);

  const confirmar = () => {
    if (pedir && motivo.trim().length < 5) { setError("Escribe la causa justificada. Queda registrada en la ficha."); return; }
    onConfirmar({ motivo: motivo.trim(), dias: parseInt(dias, 10) || 0 });
  };

  const t = {
    marcar: { t: "Marcar una sesión suelta", p: `Se descuenta una sesión del bono de ${nombre} con la fecha y hora de ahora.`, cta: "Marcar sesión" },
    renovar: { t: b && ["activo", "congelado"].includes(estado(b)) ? "Renovar el bono" : "Vender un bono nuevo", p: null, cta: "Activar bono nuevo" },
    congelar: { t: "Poner el bono en pausa", p: `Mientras esté en pausa, ${nombre} no puede usar sesiones y la caducidad deja de correr.`, cta: "Poner en pausa" },
    reactivar: { t: "Reactivar el bono", p: `${nombre} vuelve a poder entrenar. Los días en pausa se suman a la caducidad.`, cta: "Reactivar" },
    prorroga: { t: "Ampliar la caducidad", p: "Solo con causa justificada. Queda registrado y el deportista lo ve en su bono.", cta: "Ampliar caducidad" },
  }[dlg.tipo];

  const arr = b && ["activo", "congelado"].includes(estado(b)) ? restantes(b) : 0;
  const perd = b && estado(b) === "caducado" ? restantes(b) : 0;
  const pausa = dlg.tipo === "reactivar" && b?.congelacion ? Math.max(1, Math.ceil((HOY - new Date(b.congelacion.desde)) / DIA)) : 0;

  return (
    <div className="velo" onClick={onCerrar}>
      <div className="dlg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>{t.t}</h3>
        {t.p && <p>{t.p}</p>}
        {dlg.tipo === "renovar" && (
          <p>Bono de {SESIONES_BASE} sesiones válido {SEMANAS_VALIDEZ} semanas, hasta el <b>{fFecha(masSemanas(new Date().toISOString(), SEMANAS_VALIDEZ))}</b>.
            {arr > 0 && <> Se arrastran <b>{plural(arr, "sesión sin usar", "sesiones sin usar")}</b>, así que empieza con <b>{SESIONES_BASE + arr}</b>.</>}
            {perd > 0 && <> El bono anterior caducó: <b>{plural(perd, "sesión se pierde", "sesiones se pierden")}</b>. Si la causa está justificada, amplía antes la caducidad.</>}</p>
        )}
        {dlg.tipo === "reactivar" && <p>Ha estado <b>{plural(pausa, "día", "días")}</b> en pausa. Nueva caducidad: <b>{fFecha(masDias(caducidad(b), pausa))}</b>.</p>}
        {dlg.tipo === "prorroga" && (
          <label className="campo"><span className="eyebrow">Cuánto se amplía</span>
            <select value={dias} onChange={(e) => setDias(e.target.value)}>
              <option value="7">1 semana</option><option value="14">2 semanas</option><option value="28">4 semanas</option><option value="56">8 semanas</option>
            </select></label>
        )}
        {pedir && (
          <label className="campo"><span className="eyebrow">Causa justificada</span>
            <textarea value={motivo} onChange={(e) => { setMotivo(e.target.value); setError(""); }} placeholder="Ej.: lesión de rodilla, parte médico entregado el 12 de marzo" /></label>
        )}
        {error && <div className="err">{error}</div>}
        <div className="dlg-pie">
          <button className="btn" onClick={onCerrar}>Cancelar</button>
          <button className="btn pri" onClick={confirmar}>{t.cta}</button>
        </div>
      </div>
    </div>
  );
}
