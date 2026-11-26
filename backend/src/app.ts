// Arma la aplicación conectando las capas: repositories -> services -> controllers/rutas.
// Recibe la base, el reloj y la configuración, para poder usar otros en los tests.
import cors from 'cors';
import express from 'express';
import type { Db } from './db/conexion.js';
import { relojDelSistema, type Reloj } from './domain/tiempo.js';
import { manejoDeErrores, rutaInexistente } from './middlewares/manejoDeErrores.js';
import { crearMovimientoRepository } from './repositories/movimientoRepository.js';
import { crearPresupuestoRepository } from './repositories/presupuestoRepository.js';
import { crearRutas } from './routes/index.js';
import { crearAuthService, type ConfigAuth } from './services/authService.js';
import { crearMovimientoService } from './services/movimientoService.js';
import { crearResumenService } from './services/resumenService.js';

export interface Dependencias {
  db: Db;
  auth: ConfigAuth;
  corsOrigin: string[];
  reloj?: Reloj;
}

export function createApp({ db, auth, corsOrigin, reloj = relojDelSistema }: Dependencias) {
  const movimientoRepo = crearMovimientoRepository(db);
  const presupuestoRepo = crearPresupuestoRepository(db);

  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '20kb' }));

  app.use('/api', crearRutas({
    auth: crearAuthService(auth),
    movimientos: crearMovimientoService(movimientoRepo, reloj),
    resumen: crearResumenService(movimientoRepo, presupuestoRepo),
  }));

  app.use(rutaInexistente);
  app.use(manejoDeErrores);
  return app;
}
