// Arma una app de prueba con PostgreSQL real en memoria (PGlite), las migraciones reales
// y un reloj fijo. Cada archivo de tests usa su propia base.
import request from 'supertest';
import { createApp } from '../src/app.js';
import { conectar, type Db } from '../src/db/conexion.js';
import { migrar } from '../src/db/migrar.js';
import { crearRelojFijo } from '../src/domain/tiempo.js';

export const AUTH = {
  jwtSecret: 'secreto-de-prueba-de-al-menos-32-caracteres',
  usuarioEmail: 'yo@misgastos.app',
  usuarioPassword: 'clave-de-prueba',
};

export async function crearEntorno(ahoraISO = '2026-11-25T12:00:00-03:00') {
  const db: Db = await conectar('');
  await migrar(db);
  const reloj = crearRelojFijo(ahoraISO);
  const app = createApp({ db, auth: AUTH, corsOrigin: ['http://localhost:5173'], reloj });

  const login = await request(app).post('/api/login').send({ email: AUTH.usuarioEmail, password: AUTH.usuarioPassword });
  const token = login.body.token as string;

  /** Helpers con sesión iniciada. */
  const api = {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string, body: object) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body),
    put: (url: string, body: object) => request(app).put(url).set('Authorization', `Bearer ${token}`).send(body),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };

  const limpiar = () => db.exec('DELETE FROM movimientos; DELETE FROM presupuestos;');
  return { app, db, reloj, token, api, limpiar };
}

export const gastoValido = {
  tipo: 'gasto',
  descripcion: 'Supermercado',
  montoCentavos: 1_250_050,
  categoria: 'Comida',
  fecha: '2026-11-20',
  medioDePago: 'Débito',
};
