import { describe, expect, it } from 'vitest';
import { formatearMonto, hoyEnArgentina, nombreDelMes, parsearMontoEnPesos, sumarMes } from './formato';

describe('[RN-04] parsearMontoEnPesos: texto del usuario -> centavos', () => {
  it.each([
    ['12500', 1_250_000],
    ['12.500', 1_250_000],
    ['12.500,50', 1_250_050],
    ['12500,5', 1_250_050],
    ['12500.50', 1_250_050],
    ['$ 1.000', 100_000],
    ['0,01', 1],
    ['1.234.567,89', 123_456_789],
  ])('"%s" -> %i', (texto, centavos) => {
    expect(parsearMontoEnPesos(texto)).toBe(centavos);
  });

  it('no usa float: "0,1" + "0,2" en centavos da exactamente 30', () => {
    expect(parsearMontoEnPesos('0,1')! + parsearMontoEnPesos('0,2')!).toBe(30);
  });

  it.each(['', 'abc', '0', '0,00', '-500', '12,345', '1.2.3', '12.50.0', '1,2,3'])('"%s" no es válido', (texto) => {
    expect(parsearMontoEnPesos(texto)).toBeNull();
  });
});

describe('formatos para mostrar', () => {
  it('formatearMonto usa el formato argentino', () => {
    expect(formatearMonto(1_250_050).replace(/\s/g, ' ')).toBe('$ 12.500,50');
  });
  it('nombreDelMes y sumarMes', () => {
    expect(nombreDelMes('2026-11')).toBe('noviembre 2026');
    expect(sumarMes('2026-12', 1)).toBe('2027-01');
    expect(sumarMes('2026-01', -1)).toBe('2025-12');
  });
  it('[RN-02] hoy en Argentina: 23:30 del 25/11 sigue siendo 25/11', () => {
    expect(hoyEnArgentina(new Date('2026-11-26T02:30:00Z'))).toBe('2026-11-25');
  });
});
