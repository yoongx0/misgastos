import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { migrar } from '../src/db/migrar.js';
import { AUTH, crearEntorno } from './helpers.js';

let e: Awaited<ReturnType<typeof crearEntorno>>;
beforeAll(async () => {
  e = await crearEntorno();
});
afterAll(() => e.db.cerrar());

describe('rutas públicas', () => {
  it('GET /api/health responde sin sesión', async () => {
    const res = await request(e.app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
  it('una ruta inexistente responde 404', async () => {
    expect((await request(e.app).get('/api/no-existe')).status).toBe(401); // primero pide sesión
    expect((await e.api.get('/api/no-existe')).status).toBe(404);
  });
});

describe('[RN-09][HU-07] login', () => {
  it('con las credenciales correctas devuelve un token (el email no distingue mayúsculas)', async () => {
    const res = await request(e.app).post('/api/login').send({ email: '  YO@misgastos.app ', password: AUTH.usuarioPassword });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
  });
  it('contraseña o email incorrectos: 401 con el MISMO mensaje (no revela cuál falló)', async () => {
    const malaClave = await request(e.app).post('/api/login').send({ email: AUTH.usuarioEmail, password: 'otra' });
    const malEmail = await request(e.app).post('/api/login').send({ email: 'otro@x.com', password: AUTH.usuarioPassword });
    expect(malaClave.status).toBe(401);
    expect(malEmail.status).toBe(401);
    expect(malaClave.body.error).toBe(malEmail.body.error);
  });
  it('body vacío: 401, no 500', async () => {
    expect((await request(e.app).post('/api/login').send({})).status).toBe(401);
  });
});

describe('[RN-09] rutas protegidas', () => {
  it('sin token: 401', async () => {
    expect((await request(e.app).get('/api/movimientos?mes=2026-11')).status).toBe(401);
  });
  it('token inventado o firmado con otro secreto: 401', async () => {
    const falso = jwt.sign({ sub: AUTH.usuarioEmail }, 'otro-secreto-cualquiera-de-32-caracteres!!');
    for (const token of ['abc.def.ghi', falso]) {
      const res = await request(e.app).get('/api/catalogos').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(401);
    }
  });
  it('token vencido: 401', async () => {
    const vencido = jwt.sign({ sub: AUTH.usuarioEmail, exp: Math.floor(Date.now() / 1000) - 60 }, AUTH.jwtSecret);
    expect((await request(e.app).get('/api/catalogos').set('Authorization', `Bearer ${vencido}`)).status).toBe(401);
  });
  it('con sesión válida responde', async () => {
    const res = await e.api.get('/api/catalogos');
    expect(res.status).toBe(200);
    expect(res.body.categoriasIngreso).toEqual(['Sueldo', 'Extras', 'Otros ingresos']);
  });
});

describe('migraciones', () => {
  it('correr las migraciones dos veces no aplica nada nuevo', async () => {
    expect(await migrar(e.db)).toEqual([]);
  });
});
