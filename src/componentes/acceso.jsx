/** Pantallas públicas: crear cuenta, entrar y confirmar el correo. */
import React, { useState } from 'react';
import { HOY, DIA, SEMANAS_VALIDEZ, SESIONES_BASE, nuevoId, hace, masDias, masSemanas,
  crearBono, totalSesiones, usadas, restantes, caducidad, diasParaCaducar, estado,
  bonoVigente, bonoUsable, bonoPendiente, bonosPasados, ordenados,
  fFecha, fCorta, fHora, fDia, plural, norm, sinTildes, coincide, claveClase, fClase } from '../dominio/bonos.js';
import { CLAVES_DEBILES } from '../datos/ejemplo.js';
import { Check, Clave } from './comunes.jsx';

/* ═══════════════════ REGISTRO ═══════════════════ */

export function Registro({ clientes, onCrear, onIrAcceso }) {
  const [f, setF] = useState({ nombre: "", email: "", clave: "", clave2: "", condiciones: false });
  const [tocado, setTocado] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim());
  const yaTieneCuenta = clientes.some((c) => norm(c.email) === norm(f.email) && c.cuenta);
  const debil = CLAVES_DEBILES.includes(f.clave.toLowerCase());

  const err = {
    nombre: f.nombre.trim().length < 3 ? "Escribe tu nombre y apellidos." : null,
    email: !f.email.trim() ? "Necesitamos tu correo."
      : !emailOk ? "Este correo no tiene un formato válido."
      : yaTieneCuenta ? "Ya existe una cuenta con este correo. Entra en lugar de registrarte." : null,
    clave: f.clave.length < 8 ? "Mínimo 8 caracteres."
      : debil ? "Esta contraseña es demasiado común. Elige otra." : null,
    clave2: f.clave2 !== f.clave ? "Las dos contraseñas no coinciden." : null,
    condiciones: !f.condiciones ? "Falta aceptar las condiciones." : null,
  };
  const hayErr = Object.values(err).some(Boolean);
  const m = (k) => tocado && err[k];

  const enviar = () => {
    setTocado(true);
    if (hayErr) return;
    onCrear({ nombre: f.nombre.trim(), email: f.email.trim().toLowerCase(), clave: f.clave });
  };

  return (
    <div className="auth">
      <div className="auth-marca" aria-hidden="true">{[1,2,3,4,5,6].map(n => <i key={n} />)}</div>
      <h2>Crear cuenta</h2>
      <p>Con tu cuenta puedes ver tu bono, cuántas sesiones te quedan y las clases del centro.</p>

      <label className={`campo${m("nombre") ? " mal" : ""}`}>
        <span className="eyebrow">Nombre y apellidos</span>
        <input value={f.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Marta Ribas" autoComplete="name" />
        {m("nombre") && <div className="pista mal">{err.nombre}</div>}
      </label>

      <label className={`campo${m("email") ? " mal" : ""}`}>
        <span className="eyebrow">Correo electrónico</span>
        <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="marta.ribas@correo.com" autoComplete="email" />
        {m("email") ? <div className="pista mal">{err.email}</div>
          : <div className="pista">Usa el mismo correo que diste en recepción. Así tu bono aparece solo.</div>}
      </label>

      <Clave valor={f.clave} onChange={(v) => set("clave", v)} etiqueta="Contraseña"
        error={m("clave") ? err.clave : null} pista="Mínimo 8 caracteres. Cuanto más larga, mejor." medidor />

      <Clave valor={f.clave2} onChange={(v) => set("clave2", v)} etiqueta="Repite la contraseña"
        error={m("clave2") ? err.clave2 : null} />

      <div style={{ margin: "4px 0 18px" }}>
        <Check on={f.condiciones} onClick={() => set("condiciones", !f.condiciones)} mal={m("condiciones")}
          titulo="Acepto las condiciones y la política de privacidad"
          desc="Guardamos tu nombre, correo y tu historial de asistencia para gestionar el bono. Puedes pedir acceso o borrado cuando quieras." />
      </div>

      {tocado && hayErr && <div className="alerta-caja mal">Revisa los campos marcados en rojo.</div>}

      <button className="btn pri grande ancho" onClick={enviar}>Crear cuenta</button>

      <div className="auth-pie">
        ¿Ya tienes cuenta? <button className="enlace" onClick={onIrAcceso}>Entrar</button>
      </div>
    </div>
  );
}

/* ═══════════════════ ACCESO ═══════════════════ */

export function Acceso({ clientes, onEntrar, onIrRegistro }) {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  const entrar = () => {
    const c = clientes.find((x) => norm(x.email) === norm(email));
    if (!c || !c.cuenta || c.cuenta.clave !== clave) {
      setError("El correo o la contraseña no son correctos.");
      return;
    }
    onEntrar(c.id);
  };

  return (
    <div className="auth">
      <div className="auth-marca" aria-hidden="true">{[1,2,3,4,5,6].map(n => <i key={n} />)}</div>
      <h2>Entrar</h2>
      <p>Accede para ver tu bono y las clases.</p>

      <label className="campo">
        <span className="eyebrow">Correo electrónico</span>
        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} autoComplete="email" />
      </label>

      <Clave valor={clave} onChange={(v) => { setClave(v); setError(""); }} etiqueta="Contraseña" />

      {error && <div className="alerta-caja mal">{error}</div>}

      <button className="btn pri grande ancho" onClick={entrar}>Entrar</button>

      <div className="auth-pie">
        <button className="enlace" onClick={() => alert("Prototipo: aquí iría el correo de recuperación.")}>He olvidado la contraseña</button>
        <br /><br />
        ¿Aún no tienes cuenta? <button className="enlace" onClick={onIrRegistro}>Créala aquí</button>
      </div>

      <div className="aviso-proto" style={{ marginTop: 18, marginBottom: 0 }}>
        <b>Prototipo.</b> Prueba con <b>marta.ribas@correo.com</b> y la contraseña <b>entreno2026</b>.
      </div>
    </div>
  );
}

/* ═══════════════════ VERIFICACIÓN ═══════════════════ */

export function Verificar({ cliente, onVerificar, onSalir }) {
  return (
    <div className="auth">
      <div className="sobre">
        <span className="sobre-ico" aria-hidden="true">✉</span>
        <h2>Comprueba tu correo</h2>
        <p style={{ marginTop: 8 }}>
          Hemos enviado un enlace a <b>{cliente.email}</b>. Ábrelo para confirmar que el correo es tuyo.
        </p>
      </div>
      <div className="alerta-caja info" style={{ marginTop: 20 }}>
        Hasta que lo confirmes no podemos enseñarte tu bono. Es lo que evita que otra persona vea tu historial poniendo tu correo.
      </div>
      <button className="btn pri grande ancho" onClick={onVerificar}>Simular que he pulsado el enlace</button>
      <div className="auth-pie">
        <button className="enlace" onClick={onSalir}>Usar otro correo</button>
      </div>
    </div>
  );
}
