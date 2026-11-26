import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { crearEntorno, gastoValido } from './helpers.js';

let e: Awaited<ReturnType<typeof crearEntorno>>;
beforeAll(async () => {
  e = await crearEntorno('2026-11-25T12:00:00-03:00');
});
beforeEach(async () => {
  await e.limpiar();
  e.reloj.fijar('2026-11-25T12:00:00-03:00');
});
afterAll(() => e.db.cerrar());

describe('[HU-01] registrar un movimiento', () => {
  it('201 con el movimiento creado, y se lee igual con GET (contrato: fechas como texto)', async () => {
    const res = await e.api.post('/api/movimientos', gastoValido);
    expect(res.status).toBe(201);
    expect(res.body.creados).toHaveLength(1);
    expect(res.body.creados[0]).toMatchObject({ ...gastoValido, nota: null, grupoId: null, cuotaNumero: null });

    const lista = await e.api.get('/api/movimientos?mes=2026-11');
    expect(lista.body).toEqual(res.body.creados);
    expect(lista.body[0].fecha).toBe('2026-11-20'); // ni corrida de día ni objeto Date
  });

  it('400 con el detalle de cada campo inválido', async () => {
    const res = await e.api.post('/api/movimientos', { ...gastoValido, montoCentavos: 12.5, categoria: 'Sueldo' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.detalles).sort()).toEqual(['categoria', 'montoCentavos']);
  });

  it('[RN-02] a las 23:30 de Argentina, "mañana" en UTC sigue siendo futuro', async () => {
    e.reloj.fijar('2026-11-25T23:30:00-03:00'); // en UTC ya es 26/11
    expect((await e.api.post('/api/movimientos', { ...gastoValido, fecha: '2026-11-26' })).status).toBe(400);
    expect((await e.api.post('/api/movimientos', { ...gastoValido, fecha: '2026-11-25' })).status).toBe(201);
  });

  it('un texto con SQL se guarda tal cual y no ejecuta nada (consultas con parámetros)', async () => {
    const ataque = "x'); DELETE FROM movimientos; --";
    await e.api.post('/api/movimientos', gastoValido);
    const res = await e.api.post('/api/movimientos', { ...gastoValido, descripcion: ataque });
    expect(res.status).toBe(201);
    const lista = await e.api.get('/api/movimientos?mes=2026-11');
    expect(lista.body).toHaveLength(2);
    expect(lista.body.map((m: { descripcion: string }) => m.descripcion)).toContain(ataque);
  });

  it('JSON mal formado: 400, no 500', async () => {
    const res = await request(e.app).post('/api/movimientos')
      .set('Authorization', `Bearer ${e.token}`).set('Content-Type', 'application/json').send('{"tipo":');
    expect(res.status).toBe(400);
  });
});

describe('[HU-02] listar por mes', () => {
  it('solo el mes pedido, del más reciente al más antiguo', async () => {
    for (const fecha of ['2026-10-31', '2026-11-01', '2026-11-25', '2026-11-10']) {
      await e.api.post('/api/movimientos', { ...gastoValido, fecha });
    }
    const res = await e.api.get('/api/movimientos?mes=2026-11');
    expect(res.body.map((m: { fecha: string }) => m.fecha)).toEqual(['2026-11-25', '2026-11-10', '2026-11-01']);
  });
  it.each(['', '2026-13', 'noviembre'])('mes inválido "%s": 400', async (mes) => {
    expect((await e.api.get(`/api/movimientos?mes=${mes}`)).status).toBe(400);
  });
});

describe('[HU-04][RN-06] compras en cuotas', () => {
  const heladera = { ...gastoValido, descripcion: 'Heladera', montoCentavos: 100_000, medioDePago: 'Crédito', categoria: 'Otros gastos', fecha: '2026-11-10', cuotas: 3 };

  it('crea una cuota por mes, con el mismo grupo, y la suma da el total', async () => {
    const res = await e.api.post('/api/movimientos', heladera);
    expect(res.status).toBe(201);
    const cuotas = res.body.creados;
    expect(cuotas.map((c: { fecha: string; montoCentavos: number; descripcion: string }) => [c.fecha, c.montoCentavos, c.descripcion])).toEqual([
      ['2026-11-10', 33_334, 'Heladera (cuota 1/3)'],
      ['2026-12-10', 33_333, 'Heladera (cuota 2/3)'],
      ['2027-01-10', 33_333, 'Heladera (cuota 3/3)'],
    ]);
    expect(new Set(cuotas.map((c: { grupoId: string }) => c.grupoId)).size).toBe(1);
  });

  it('cada cuota cuenta en el resumen de su mes', async () => {
    await e.api.post('/api/movimientos', heladera);
    expect((await e.api.get('/api/resumen?mes=2026-12')).body.gastos).toBe(33_333);
    expect((await e.api.get('/api/resumen?mes=2027-01')).body.gastos).toBe(33_333);
  });

  it('las cuotas futuras se permiten aunque la fecha de compra no pueda ser futura', async () => {
    expect((await e.api.post('/api/movimientos', { ...heladera, fecha: '2026-11-26' })).status).toBe(400);
  });

  it('[RN-07] eliminar CUALQUIER cuota elimina toda la compra', async () => {
    const res = await e.api.post('/api/movimientos', heladera);
    const segunda = res.body.creados[1].id;
    expect((await e.api.delete(`/api/movimientos/${segunda}`)).status).toBe(204);
    for (const mes of ['2026-11', '2026-12', '2027-01']) {
      expect((await e.api.get(`/api/movimientos?mes=${mes}`)).body).toEqual([]);
    }
  });
});

describe('[HU-05][RN-07] eliminar', () => {
  it('un movimiento suelto se elimina solo él', async () => {
    const a = (await e.api.post('/api/movimientos', gastoValido)).body.creados[0];
    await e.api.post('/api/movimientos', gastoValido);
    expect((await e.api.delete(`/api/movimientos/${a.id}`)).status).toBe(204);
    expect((await e.api.get('/api/movimientos?mes=2026-11')).body).toHaveLength(1);
  });
  it('id inexistente o con otro formato: 404 (no 500)', async () => {
    expect((await e.api.delete('/api/movimientos/00000000-0000-0000-0000-000000000000')).status).toBe(404);
    expect((await e.api.delete('/api/movimientos/abc')).status).toBe(404);
  });
});
