/** Lo que ve el deportista: su bono, sus sesiones, sus avisos y su historial. */
import React, { useState } from 'react';
import { HOY, DIA, SEMANAS_VALIDEZ, SESIONES_BASE, nuevoId, hace, masDias, masSemanas,
  crearBono, totalSesiones, usadas, restantes, caducidad, diasParaCaducar, estado,
  bonoVigente, bonoUsable, bonoPendiente, bonosPasados, ordenados,
  fFecha, fCorta, fHora, fDia, plural, norm, sinTildes, coincide, claveClase, fClase } from '../dominio/bonos.js';
import { Medidor, Chip } from './comunes.jsx';

/* ═══════════════════ vista deportista ═══════════════════ */

export function VistaDeportista({ cliente, onAviso }) {
  const [tab, setTab] = useState("sesiones");
  const b = bonoVigente(cliente);
  const pasados = bonosPasados(cliente);

  if (!b) {
    return (
      <>
        <div className="vacio">
          <strong>Todavía no tienes ningún bono</strong>
          Tu cuenta está lista. Cuando compres un bono en recepción aparecerá aquí automáticamente.
        </div>
        {pasados.length > 0 && (
          <>
            <div className="tabs" style={{ marginTop: 32 }}>
              <button className="tab on">Bonos anteriores<span className="tab-c">{pasados.length}</span></button>
            </div>
            {pasados.map((x) => <BonoPasado key={x.id} b={x} />)}
          </>
        )}
      </>
    );
  }

  const congelado = !!b.congelacion, dias = diasParaCaducar(b), orden = ordenados(b);
  const prorrogas = b.ajustes.filter((a) => a.tipo === "prorroga");

  return (
    <>
      <div className="bono">
        {congelado && <div className="banda frio"><span>❄</span><div><strong>Bono en pausa desde el {fFecha(b.congelacion.desde)}.</strong> No corre la caducidad ni puedes usar sesiones hasta que recepción lo reactive.</div></div>}
        {!congelado && prorrogas.length > 0 && <div className="banda amber"><span>↻</span><div><strong>Caducidad ampliada {plural(prorrogas.reduce((s, p) => s + p.dias, 0), "día", "días")}.</strong> {prorrogas[prorrogas.length - 1].motivo}</div></div>}

        <div className="bono-top">
          <div className="bono-serv">
            <div>
              <span className="eyebrow">Bono de {b.sesionesBase} sesiones{b.arrastradas > 0 ? ` + ${b.arrastradas} arrastradas` : ""}</span>
              <h2>{b.servicio}</h2>
            </div>
            <Chip b={b} />
          </div>
          <div className="cuenta">
            <span className="cuenta-num">{restantes(b)}</span>
            <span className="cuenta-de">/ {totalSesiones(b)}</span>
            <span className="cuenta-lab">{restantes(b) === 1 ? "sesión te queda" : "sesiones te quedan"}</span>
          </div>
          <Medidor b={b} />
          {b.arrastradas > 0 && <div className="leyenda"><i /> Las {b.arrastradas} últimas vienen de tu bono anterior</div>}
        </div>
        <div className="rasgado" />
        <div className="bono-pie">
          <div className="dato"><span className="eyebrow">Sesiones usadas</span><span className="dato-val">{usadas(b)} de {totalSesiones(b)}</span></div>
          <div className="dato"><span className="eyebrow">{congelado ? "Caducaba el" : "Caduca el"}</span><span className={`dato-val${!congelado && dias <= 7 ? " alerta" : ""}`}>{fFecha(caducidad(b))}</span></div>
          <div className="dato"><span className="eyebrow">Tiempo restante</span><span className={`dato-val${!congelado && dias <= 7 ? " alerta" : ""}`}>{congelado ? "En pausa" : plural(dias, "día", "días")}</span></div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${tab === "sesiones" ? " on" : ""}`} onClick={() => setTab("sesiones")}>Sesiones<span className="tab-c">{orden.length}</span></button>
        <button className={`tab${tab === "avisos" ? " on" : ""}`} onClick={() => setTab("avisos")}>Avisos</button>
        <button className={`tab${tab === "historial" ? " on" : ""}`} onClick={() => setTab("historial")}>Bonos anteriores<span className="tab-c">{pasados.length}</span></button>
      </div>

      {tab === "sesiones" && (orden.length === 0 ? (
        <div className="vacio"><strong>Aún no has usado ninguna sesión</strong>Recepción marca cada clase a la que asistes y aparece aquí al momento.</div>
      ) : (
        <div className="log">
          {[...orden].reverse().map((c, i) => (
            <div className="log-fila" key={c.id}>
              <span className="log-n">{orden.length - i}</span>
              <div><div className="log-fecha">{fFecha(c.fecha)}</div><div className="sub">{fDia(c.fecha)} · {fHora(c.fecha)}</div></div>
              <span className="log-meta">{b.servicio}</span>
            </div>
          ))}
        </div>
      ))}

      {tab === "avisos" && (
        <>
          <div className="aviso">
            <div><h4>Cuando me quede una sesión</h4><p>Te escribimos en cuanto recepción marque tu penúltima clase, para que puedas renovar a tiempo.</p></div>
            <button className={`sw${cliente.avisos.ultimaSesion ? " on" : ""}`} onClick={() => onAviso("ultimaSesion")} aria-pressed={cliente.avisos.ultimaSesion} aria-label="Avisarme cuando me quede una sesión" />
          </div>
          <div className="aviso">
            <div><h4>Una semana antes de caducar</h4><p>Aviso 7 días antes de la fecha de caducidad, tengas las sesiones que tengas sin usar.</p></div>
            <button className={`sw${cliente.avisos.caducidad ? " on" : ""}`} onClick={() => onAviso("caducidad")} aria-pressed={cliente.avisos.caducidad} aria-label="Avisarme una semana antes de caducar" />
          </div>
          <div className="nota">Los avisos se envían a <strong>{cliente.email}</strong>.</div>
          {cliente.avisos.ultimaSesion && !congelado && restantes(b) === 1 && <div className="disparo"><strong>Aviso enviado.</strong> Te queda 1 sesión. Si renuevas antes de gastarla, se suma al bono nuevo.</div>}
          {cliente.avisos.caducidad && !congelado && dias <= 7 && dias >= 0 && <div className="disparo"><strong>Aviso enviado.</strong> Tu bono caduca el {fFecha(caducidad(b))} y todavía te{restantes(b) === 1 ? " queda 1 sesión" : ` quedan ${restantes(b)} sesiones`}.</div>}
        </>
      )}

      {tab === "historial" && (pasados.length === 0 ? (
        <div className="vacio"><strong>Este es tu primer bono</strong>Cuando lo termines aparecerá aquí con todas sus fechas.</div>
      ) : pasados.map((x) => <BonoPasado key={x.id} b={x} />))}
    </>
  );
}

export function BonoPasado({ b }) {
  const [abierto, setAbierto] = useState(false);
  const orden = ordenados(b), sobra = restantes(b), e = estado(b);
  return (
    <div className="hist">
      <div className="hist-cab">
        <div><div className="hist-t">{b.servicio}</div>
          <div className="sub">{fFecha(b.fechaCompra)} → {fFecha(caducidad(b))} · {usadas(b)}/{totalSesiones(b)} usadas</div></div>
        <Chip b={b} />
      </div>
      <Medidor b={b} mini apagado />
      {e === "renovado" && sobra > 0 && <div className="sub" style={{ marginTop: 10 }}>↳ {plural(sobra, "sesión pasó", "sesiones pasaron")} al bono siguiente</div>}
      {e === "caducado" && sobra > 0 && <div className="sub" style={{ marginTop: 10, color: "var(--red)" }}>↳ {plural(sobra, "sesión caducó", "sesiones caducaron")} sin usar</div>}
      <button className="btn mini" style={{ marginTop: 14 }} onClick={() => setAbierto(!abierto)}>{abierto ? "Ocultar fechas" : "Ver fechas"}</button>
      {abierto && (
        <div className="anular" style={{ marginTop: 12 }}>
          {orden.map((c, i) => (
            <div className="anular-f" key={c.id}>
              <span className="log-n gris">{i + 1}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{fFecha(c.fecha)}</span>
              <span className="log-meta">{fHora(c.fecha)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
