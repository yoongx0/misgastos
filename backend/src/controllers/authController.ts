import type { Request, Response } from 'express';
import type { AuthService } from '../services/authService.js';

export function crearAuthController(service: AuthService) {
  return {
    login: (req: Request, res: Response) => {
      res.json({ token: service.login(req.body) });
    },
  };
}
