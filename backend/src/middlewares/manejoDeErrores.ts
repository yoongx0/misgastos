// Traduce los errores de negocio a respuestas HTTP con el formato de docs/api.md.
import type { NextFunction, Request, Response } from 'express';
import { ErrorDeValidacion, NoAutorizado, NoEncontrado } from '../shared/errores.js';

export function manejoDeErrores(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ErrorDeValidacion) {
    return res.status(400).json({ error: error.message, detalles: error.detalles });
  }
  if (error instanceof NoAutorizado) return res.status(401).json({ error: error.message });
  if (error instanceof NoEncontrado) return res.status(404).json({ error: error.message });
  if ((error as { type?: string }).type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' });
  }
  // Error inesperado: se registra completo en el servidor, pero al cliente no se le dan detalles internos.
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor.' });
}

export function rutaInexistente(_req: Request, res: Response) {
  res.status(404).json({ error: 'Ruta inexistente.' });
}
