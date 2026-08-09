import { describe, it, expect } from 'vitest';
import {
  crearBono, cons, hace, masDias, SESIONES_BASE,
  estado, restantes, totalSesiones, caducidad,
  renovarBono, reactivarBono, prorrogarBono, anularConsumo,
} from './bonos.js';

describe('renovarBono', () => {
  it('arrastra las sesiones vivas al bono nuevo', () => {
    const bono = crearBono(hace(20), { consumos: cons([15, 10], [10, 10], [5, 10]) }); // 3 consumos → 7 restantes
    expect(estado(bono)).toBe('activo');

    const { bonoNuevo, bonoCerrado, arrastradas } = renovarBono(bono, new Date().toISOString());

    expect(arrastradas).toBe(7);
    expect(bonoNuevo.arrastradas).toBe(7);
    expect(totalSesiones(bonoNuevo)).toBe(SESIONES_BASE + 7);
    expect(bonoCerrado.cerrado).toBe(true);
    expect(bonoCerrado.congelacion).toBeNull();
  });

  it('no arrastra nada de un bono ya caducado', () => {
    const bono = crearBono(hace(90), { consumos: cons([85, 10], [80, 10]) }); // caducidad base a los 84 días → caducado hace 6 días
    expect(estado(bono)).toBe('caducado');
    expect(restantes(bono)).toBeGreaterThan(0);

    const { bonoNuevo, arrastradas } = renovarBono(bono, new Date().toISOString());

    expect(arrastradas).toBe(0);
    expect(bonoNuevo.arrastradas).toBe(0);
    expect(totalSesiones(bonoNuevo)).toBe(SESIONES_BASE);
  });
});

describe('reactivarBono', () => {
  it('detiene la caducidad en pausa y suma los días parados al reactivar', () => {
    const bono = crearBono(hace(30), { congelacion: { desde: hace(10), motivo: 'Lesión de rodilla' } });
    expect(estado(bono)).toBe('congelado');
    const caducidadAntes = caducidad(bono);

    const { bono: reactivado, dias } = reactivarBono(bono);

    expect(dias).toBeGreaterThanOrEqual(9); // ~10 días en pausa
    expect(reactivado.congelacion).toBeNull();
    expect(caducidad(reactivado)).toBe(masDias(caducidadAntes, dias));
  });
});

describe('prorrogarBono', () => {
  it('sobre un bono caducado lo devuelve a estado activo', () => {
    const bono = crearBono(hace(90)); // caducado hace 6 días, sin arrastres
    expect(estado(bono)).toBe('caducado');

    const bonoProrrogado = prorrogarBono(bono, 28, 'Recuperación pactada con el cliente');

    expect(estado(bonoProrrogado)).toBe('activo');
  });
});

describe('anularConsumo', () => {
  it('devuelve la sesión anulada al saldo disponible', () => {
    const consumos = cons([5, 10], [3, 10]);
    const bono = crearBono(hace(20), { consumos });
    const cliente = { id: 'x1', nombre: 'Cliente de prueba', bonos: [bono] };
    const restantesAntes = restantes(bono);

    const clienteActualizado = anularConsumo(cliente, consumos[0].id);
    const bonoActualizado = clienteActualizado.bonos[0];

    expect(restantes(bonoActualizado)).toBe(restantesAntes + 1);
    expect(bonoActualizado.consumos.find((x) => x.id === consumos[0].id)).toBeUndefined();
  });
});
