// RN-09: sin token válido, 401. Se aplica a todas las rutas salvo /health y /login.
import type { NextFunction, Request, Response } from 'express';
import type { AuthService } from '../services/authService.js';
import { NoAutorizado } from '../shared/errores.js';

export function requiereSesion(auth: AuthService) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new NoAutorizado('Falta iniciar sesión.');
    auth.verificar(token);
    next();
  };
}
