import { describe, expect, it } from 'vitest';
import {
  crearRelojFijo, esFechaValida, esMesValido, fechaLocal, hoy, rangoDelMes, sumarMeses,
} from '../src/domain/tiempo.js';

describe('[RN-02] "hoy" es la fecha en Argentina, no en UTC', () => {
  it('a las 23:30 de Argentina ya es el día siguiente en UTC, pero "hoy" sigue siendo el mismo día', () => {
    // 2026-11-26T02:30Z = 25/11 23:30 en Buenos Aires
    expect(fechaLocal(new Date('2026-11-26T02:30:00Z'))).toBe('2026-11-25');
  });
  it('a las 00:30 de Argentina ya cambió el día', () => {
    expect(fechaLocal(new Date('2026-11-26T03:30:00Z'))).toBe('2026-11-26');
  });
  it('el reloj fijo se puede adelantar (control remoto del tiempo)', () => {
    const reloj = crearRelojFijo('2026-11-25T12:00:00-03:00');
    expect(hoy(reloj)).toBe('2026-11-25');
    reloj.fijar('2026-12-01T09:00:00-03:00');
    expect(hoy(reloj)).toBe('2026-12-01');
  });
});

describe('fechas y meses válidos', () => {
  it('acepta fechas reales, incluido el 29/02 de un año bisiesto', () => {
    expect(esFechaValida('2026-11-25')).toBe(true);
    expect(esFechaValida('2028-02-29')).toBe(true);
  });
  it('rechaza fechas que no existen o con otro formato', () => {
    for (const f of ['2026-02-29', '2026-02-30', '2026-13-01', '2026-11-00', '25/11/2026', '2026-1-5', '', null, 20261125]) {
      expect(esFechaValida(f), String(f)).toBe(false);
    }
  });
  it('valida meses AAAA-MM', () => {
    expect(esMesValido('2026-11')).toBe(true);
    for (const m of ['2026-13', '2026-1', '2026-00', 'noviembre', '']) expect(esMesValido(m), m).toBe(false);
  });
  it('rangoDelMes conoce el último día de cada mes', () => {
    expect(rangoDelMes('2026-11')).toEqual({ desde: '2026-11-01', hasta: '2026-11-30' });
    expect(rangoDelMes('2026-02')).toEqual({ desde: '2026-02-01', hasta: '2026-02-28' });
    expect(rangoDelMes('2028-02')).toEqual({ desde: '2028-02-01', hasta: '2028-02-29' });
  });
});

describe('[RN-06] sumarMeses (fechas de las cuotas)', () => {
  it('conserva el día', () => {
    expect(sumarMeses('2026-11-10', 1)).toBe('2026-12-10');
  });
  it('cruza el año', () => {
    expect(sumarMeses('2026-11-10', 3)).toBe('2027-02-10');
  });
  it('si el día no existe usa el último día del mes (31/01 -> 28/02)', () => {
    expect(sumarMeses('2027-01-31', 1)).toBe('2027-02-28');
    expect(sumarMeses('2028-01-31', 1)).toBe('2028-02-29'); // bisiesto
    expect(sumarMeses('2026-08-31', 1)).toBe('2026-09-30');
  });
  it('no "arrastra" el recorte: 31/01 + 2 meses = 31/03', () => {
    expect(sumarMeses('2027-01-31', 2)).toBe('2027-03-31');
  });
});
