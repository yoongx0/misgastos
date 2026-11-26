import { describe, expect, it } from 'vitest';
import { generarCuotas } from '../src/domain/cuotas.js';

describe('[RN-06] generarCuotas', () => {
  it('$1.000 en 3 cuotas: 333,34 + 333,33 + 333,33 (el resto va a la primera)', () => {
    const cuotas = generarCuotas({ descripcion: 'Zapatillas', montoCentavos: 100_000, fecha: '2026-11-10', cuotas: 3 });
    expect(cuotas.map((c) => c.montoCentavos)).toEqual([33_334, 33_333, 33_333]);
  });
  it('la suma de las cuotas es exactamente el total', () => {
    for (const [total, n] of [[100_000, 3], [999_999, 7], [1, 1], [5, 2], [123_456_789, 24]]) {
      const cuotas = generarCuotas({ descripcion: 'X', montoCentavos: total, fecha: '2026-11-10', cuotas: n });
      expect(cuotas.reduce((s, c) => s + c.montoCentavos, 0)).toBe(total);
      expect(cuotas.every((c) => Number.isInteger(c.montoCentavos))).toBe(true);
    }
  });
  it('una cuota por mes, desde la fecha de compra, y descripción numerada', () => {
    const cuotas = generarCuotas({ descripcion: 'Heladera', montoCentavos: 120_000_00, fecha: '2026-11-10', cuotas: 3 });
    expect(cuotas.map((c) => [c.fecha, c.descripcion, c.cuotaNumero, c.cuotaTotal])).toEqual([
      ['2026-11-10', 'Heladera (cuota 1/3)', 1, 3],
      ['2026-12-10', 'Heladera (cuota 2/3)', 2, 3],
      ['2027-01-10', 'Heladera (cuota 3/3)', 3, 3],
    ]);
  });
  it('compra del 31: las cuotas caen el último día de los meses cortos', () => {
    const fechas = generarCuotas({ descripcion: 'TV', montoCentavos: 400_00, fecha: '2027-01-31', cuotas: 4 }).map((c) => c.fecha);
    expect(fechas).toEqual(['2027-01-31', '2027-02-28', '2027-03-31', '2027-04-30']);
  });
});
