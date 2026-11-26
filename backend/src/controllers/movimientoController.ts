// HTTP <-> servicio. Sin reglas de negocio. Express 5 pasa los errores async al middleware de errores.
import type { Request, Response } from 'express';
import type { MovimientoService } from '../services/movimientoService.js';

export function crearMovimientoController(service: MovimientoService) {
  return {
    listar: async (req: Request, res: Response) => {
      res.json(await service.listarDelMes(req.query.mes));
    },
    crear: async (req: Request, res: Response) => {
      res.status(201).json({ creados: await service.registrar(req.body) });
    },
    eliminar: async (req: Request<{ id: string }>, res: Response) => {
      await service.eliminar(req.params.id);
      res.status(204).end();
    },
  };
}
