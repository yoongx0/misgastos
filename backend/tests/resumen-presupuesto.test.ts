import { describe, expect, it } from 'vitest';
import { calcularResumenDelMes } from '../src/domain/resumen.js';
import { evaluarPresupuesto, evaluarPresupuestos } from '../src/domain/presupuesto.js';
import type { Categoria, TipoMovimiento } from '../src/domain/categorias.js';

const mov = (tipo: TipoMovimiento, montoCentavos: number, categoria: Categoria, fecha = '2026-11-15') =>
  ({ tipo, montoCentavos, categoria, fecha });

describe('[RN-05] resumen mensual', () => {
  it('ingresos, gastos y saldo con centavos', () => {
    const r = calcularResumenDelMes(
      [mov('ingreso', 10_000_000, 'Sueldo'), mov('gasto', 1_250_050, 'Comida'), mov('gasto', 300_000, 'Transporte')],
      '2026-11'
    );
    expect(r).toMatchObject({ mes: '2026-11', ingresos: 10_000_000, gastos: 1_550_050, saldo: 8_449_950 });
  });
  it('gastos por categoría de mayor a menor con porcentaje', () => {
    const r = calcularResumenDelMes(
      [mov('gasto', 2_000, 'Transporte'), mov('gasto', 5_000, 'Comida'), mov('gasto', 3_000, 'Comida')],
      '2026-11'
    );
    expect(r.gastosPorCategoria).toEqual([
      { categoria: 'Comida', total: 8_000, porcentaje: 80 },
      { categoria: 'Transporte', total: 2_000, porcentaje: 20 },
    ]);
  });
  it('solo cuenta el mes pedido (bordes incluidos)', () => {
    const r = calcularResumenDelMes(
      [mov('gasto', 100, 'Ocio', '2026-10-31'), mov('gasto', 200, 'Ocio', '2026-11-01'), mov('gasto', 300, 'Ocio', '2026-11-30'), mov('gasto', 400, 'Ocio', '2026-12-01')],
      '2026-11'
    );
    expect(r.gastos).toBe(500);
  });
  it('saldo negativo y mes sin gastos', () => {
    expect(calcularResumenDelMes([mov('ingreso', 1_000, 'Sueldo'), mov('gasto', 1_001, 'Ocio')], '2026-11').saldo).toBe(-1);
    expect(calcularResumenDelMes([mov('ingreso', 5_000, 'Sueldo')], '2026-11').gastosPorCategoria).toEqual([]);
  });
});

describe('[RN-08] estado del presupuesto', () => {
  const comida = { categoria: 'Comida' as const, montoMensualCentavos: 100_000 };

  it.each([
    [0, 'OK'],
    [79_999, 'OK'],
    [80_000, 'ALERTA'],      // exactamente 80%
    [100_000, 'ALERTA'],     // exactamente 100%: todavía no se pasó (PA-08)
    [100_001, 'EXCEDIDO'],   // un centavo más
  ])('gastado %i de 100.000 -> %s', (gastado, estado) => {
    expect(evaluarPresupuesto(comida, gastado).estado).toBe(estado);
  });

  it('el estado usa la cuenta exacta: 79,6% se muestra "80" pero es OK', () => {
    const r = evaluarPresupuesto(comida, 79_600);
    expect(r.porcentaje).toBe(80);
    expect(r.estado).toBe('OK');
  });

  it('ordena del más comprometido al menos comprometido', () => {
    const r = evaluarPresupuestos(
      [comida, { categoria: 'Ocio', montoMensualCentavos: 10_000 }, { categoria: 'Transporte', montoMensualCentavos: 50_000 }],
      new Map([['Comida', 50_000], ['Ocio', 12_000]])
    );
    expect(r.map((p) => [p.categoria, p.porcentaje, p.estado])).toEqual([
      ['Ocio', 120, 'EXCEDIDO'],
      ['Comida', 50, 'OK'],
      ['Transporte', 0, 'OK'],
    ]);
  });
});
