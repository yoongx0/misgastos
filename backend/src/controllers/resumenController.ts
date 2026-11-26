import type { Request, Response } from 'express';
import type { ResumenService } from '../services/resumenService.js';

export function crearResumenController(service: ResumenService) {
  return {
    resumen: async (req: Request, res: Response) => {
      res.json(await service.resumenDelMes(req.query.mes));
    },
    presupuestos: async (req: Request, res: Response) => {
      res.json(await service.presupuestosDelMes(req.query.mes));
    },
    guardarPresupuesto: async (req: Request<{ categoria: string }>, res: Response) => {
      res.json(await service.guardarPresupuesto(req.params.categoria, req.body));
    },
    eliminarPresupuesto: async (req: Request<{ categoria: string }>, res: Response) => {
      await service.eliminarPresupuesto(req.params.categoria);
      res.status(204).end();
    },
  };
}
