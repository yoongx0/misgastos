import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { crearEntorno, gastoValido } from './helpers.js';

let e: Awaited<ReturnType<typeof crearEntorno>>;
beforeAll(async () => {
  e = await crearEntorno();
});
beforeEach(() => e.limpiar());
afterAll(() => e.db.cerrar());

describe('[HU-03][RN-05] GET /api/resumen', () => {
  it('ingresos, gastos, saldo y categorías', async () => {
    await e.api.post('/api/movimientos', { ...gastoValido, tipo: 'ingreso', categoria: 'Sueldo', medioDePago: 'Transferencia', montoCentavos: 10_000_000 });
    await e.api.post('/api/movimientos', gastoValido); // 12.500,50 Comida
    await e.api.post('/api/movimientos', { ...gastoValido, categoria: 'Transporte', montoCentavos: 300_000 });

    const res = await e.api.get('/api/resumen?mes=2026-11');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      mes: '2026-11',
      ingresos: 10_000_000,
      gastos: 1_550_050,
      saldo: 8_449_950,
      gastosPorCategoria: [
        { categoria: 'Comida', total: 1_250_050, porcentaje: 81 },
        { categoria: 'Transporte', total: 300_000, porcentaje: 19 },
      ],
    });
  });
  it('mes sin movimientos: todo en cero', async () => {
    expect((await e.api.get('/api/resumen?mes=2025-01')).body).toEqual({ mes: '2025-01', ingresos: 0, gastos: 0, saldo: 0, gastosPorCategoria: [] });
  });
});

describe('[HU-06][RN-08] presupuestos', () => {
  it('fijar, consultar el estado del mes y borrar', async () => {
    expect((await e.api.put('/api/presupuestos/Comida', { montoMensualCentavos: 1_500_000 })).status).toBe(200);
    expect((await e.api.put('/api/presupuestos/Ocio', { montoMensualCentavos: 100_000 })).status).toBe(200);
    await e.api.post('/api/movimientos', gastoValido); // 1.250.050 de 1.500.000 = 83% -> ALERTA

    const res = await e.api.get('/api/presupuestos?mes=2026-11');
    expect(res.body).toEqual([
      { categoria: 'Comida', montoMensualCentavos: 1_500_000, gastadoCentavos: 1_250_050, porcentaje: 83, estado: 'ALERTA' },
      { categoria: 'Ocio', montoMensualCentavos: 100_000, gastadoCentavos: 0, porcentaje: 0, estado: 'OK' },
    ]);

    expect((await e.api.delete('/api/presupuestos/Ocio')).status).toBe(204);
    expect((await e.api.delete('/api/presupuestos/Ocio')).status).toBe(404);
  });
  it('cambiar el monto reemplaza el anterior (un presupuesto por categoría)', async () => {
    await e.api.put('/api/presupuestos/Comida', { montoMensualCentavos: 100 });
    await e.api.put('/api/presupuestos/Comida', { montoMensualCentavos: 200 });
    const res = await e.api.get('/api/presupuestos?mes=2026-11');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].montoMensualCentavos).toBe(200);
  });
  it('EXCEDIDO cuando se pasa por un centavo', async () => {
    await e.api.put('/api/presupuestos/Comida', { montoMensualCentavos: 1_250_049 });
    await e.api.post('/api/movimientos', gastoValido);
    expect((await e.api.get('/api/presupuestos?mes=2026-11')).body[0].estado).toBe('EXCEDIDO');
  });
  it('400: categoría de ingreso o inexistente, y monto inválido', async () => {
    const res = await e.api.put('/api/presupuestos/Sueldo', { montoMensualCentavos: 0 });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.detalles).sort()).toEqual(['categoria', 'montoMensualCentavos']);
    expect((await e.api.put('/api/presupuestos/Inventada', { montoMensualCentavos: 100 })).status).toBe(400);
  });
});
