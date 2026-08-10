/** Piezas visuales reutilizadas por todas las pantallas. */
import React, { useState, useMemo } from 'react';
import { HOY, DIA, SEMANAS_VALIDEZ, SESIONES_BASE, nuevoId, hace, masDias, masSemanas,
  crearBono, totalSesiones, usadas, restantes, caducidad, diasParaCaducar, estado,
  bonoVigente, bonoUsable, bonoPendiente, bonosPasados, ordenados,
  fFecha, fCorta, fHora, fDia, plural, norm, sinTildes, coincide, claveClase, fClase } from '../dominio/bonos.js';
import { CLAVES_DEBILES } from '../datos/ejemplo.js';

/* ═══════════════════ piezas ═══════════════════ */

/* logotipo MOVE: sobre fondo oscuro se ve la versión blanca, sobre
   fondo claro la versión oscura. Hoy solo se usa en la cabecera
   (siempre oscura), pero queda listo para cualquier otro fondo. */
export function Logo({ fondo = "oscuro", className, ...props }) {
  const src = fondo === "oscuro" ? "/logo-move-blanco-1.png" : "/logo-move-oscuro-1.png";
  return <img src={src} alt="MOVE" className={className ? `logo-move ${className}` : "logo-move"} {...props} />;
}

export function Medidor({ b, mini = false, apagado = false }) {
  const orden = ordenados(b);
  return (
    <div className={mini ? "medidor mini" : "medidor"}>
      {Array.from({ length: totalSesiones(b) }, (_, i) => {
        const c = orden[i], extra = i >= b.sesionesBase;
        return (
          <div key={i} className={`seg${c ? " usada" : ""}${c && apagado ? " pasada" : ""}${extra ? " extra" : ""}`}
            title={c ? `Sesión ${i + 1} · ${fFecha(c.fecha)} a las ${fHora(c.fecha)}` : `Sesión ${i + 1} · sin usar${extra ? " (arrastrada)" : ""}`}>
            <span className="seg-n">{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Chip({ b }) {
  const e = estado(b);
  if (e === "renovado") return <span className="chip off">Renovado</span>;
  if (e === "congelado") return <span className="chip frio">En pausa</span>;
  if (e === "agotado") return <span className="chip off">Completado</span>;
  if (e === "caducado") return <span className="chip bad">Caducado</span>;
  const d = diasParaCaducar(b);
  if (restantes(b) <= 1) return <span className="chip warn">Última sesión</span>;
  if (d <= 7) return <span className="chip warn">Caduca en {d} d</span>;
  return <span className="chip ok">Activo</span>;
}

export function Check({ on, onClick, titulo, desc, mal }) {
  return (
    <div className={`check${on ? " on" : ""}${mal ? " mal" : ""}`} onClick={onClick} role="checkbox" aria-checked={on}
      tabIndex={0} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); onClick(); } }}>
      <span className="caja">{on ? "✓" : ""}</span>
      <div><div className="check-t">{titulo}</div>{desc && <div className="check-d">{desc}</div>}</div>
    </div>
  );
}

export function Clave({ valor, onChange, etiqueta, error, pista, medidor }) {
  const [ver, setVer] = useState(false);
  const f = useMemo(() => {
    const v = valor || "";
    if (v.length < 8) return 0;
    if (CLAVES_DEBILES.includes(v.toLowerCase())) return 1;
    let p = 1;
    if (v.length >= 12) p++;
    if (/[^a-zA-Z]/.test(v) && /[a-zA-Z]/.test(v)) p++;
    return Math.min(p, 3);
  }, [valor]);
  return (
    <label className={`campo${error ? " mal" : ""}`}>
      <span className="eyebrow">{etiqueta}</span>
      <div className="con-ojo">
        <input type={ver ? "text" : "password"} value={valor} onChange={(e) => onChange(e.target.value)} autoComplete="new-password" />
        <button type="button" className="ojo" onClick={() => setVer(!ver)}>{ver ? "Ocultar" : "Ver"}</button>
      </div>
      {medidor && valor && (
        <div className="fuerza" aria-hidden="true">
          {[1, 2, 3].map((n) => <i key={n} className={f >= n ? `on${f}` : ""} />)}
        </div>
      )}
      {error ? <div className="pista mal">{error}</div> : pista ? <div className="pista">{pista}</div> : null}
    </label>
  );
}
