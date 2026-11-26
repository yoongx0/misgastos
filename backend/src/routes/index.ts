// Rutas de la API (docs/api.md). Las públicas van antes del middleware de sesión.
import { Router } from 'express';
import { crearAuthController } from '../controllers/authController.js';
import { crearMovimientoController } from '../controllers/movimientoController.js';
import { crearResumenController } from '../controllers/resumenController.js';
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, MEDIOS_DE_PAGO } from '../domain/categorias.js';
import { requiereSesion } from '../middlewares/requiereSesion.js';
import type { AuthService } from '../services/authService.js';
import type { MovimientoService } from '../services/movimientoService.js';
import type { ResumenService } from '../services/resumenService.js';

export function crearRutas(servicios: { auth: AuthService; movimientos: MovimientoService; resumen: ResumenService }) {
  const router = Router();
  const auth = crearAuthController(servicios.auth);
  const movimientos = crearMovimientoController(servicios.movimientos);
  const resumen = crearResumenController(servicios.resumen);

  // Públicas
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'misgastos-backend' });
  });
  router.post('/login', auth.login);

  // Desde acá, todo requiere sesión (RN-09)
  router.use(requiereSesion(servicios.auth));

  router.get('/catalogos', (_req, res) => {
    res.json({ categoriasGasto: CATEGORIAS_GASTO, categoriasIngreso: CATEGORIAS_INGRESO, mediosDePago: MEDIOS_DE_PAGO });
  });
  router.get('/movimientos', movimientos.listar);
  router.post('/movimientos', movimientos.crear);
  router.delete('/movimientos/:id', movimientos.eliminar);
  router.get('/resumen', resumen.resumen);
  router.get('/presupuestos', resumen.presupuestos);
  router.put('/presupuestos/:categoria', resumen.guardarPresupuesto);
  router.delete('/presupuestos/:categoria', resumen.eliminarPresupuesto);

  return router;
}
