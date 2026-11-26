// HU-07 / RN-09 / ADR-004: usuario único, credenciales en variables de entorno, token JWT.
import { createHash, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { NoAutorizado } from '../shared/errores.js';

export interface ConfigAuth {
  jwtSecret: string;
  usuarioEmail: string;
  usuarioPassword: string;
  duracionSesion?: string; // PA-14 (provisorio): 7 días
}

// Se comparan los hashes (mismo largo) en tiempo constante: el tiempo de respuesta
// no revela cuántos caracteres de la contraseña eran correctos.
function igualesSeguro(a: string, b: string): boolean {
  const hash = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(hash(a), hash(b));
}

export function crearAuthService(config: ConfigAuth) {
  return {
    login(datos: unknown): string {
      const d = (typeof datos === 'object' && datos !== null ? datos : {}) as Record<string, unknown>;
      const email = typeof d.email === 'string' ? d.email.trim().toLowerCase() : '';
      const password = typeof d.password === 'string' ? d.password : '';
      const emailOk = igualesSeguro(email, config.usuarioEmail.trim().toLowerCase());
      const passwordOk = igualesSeguro(password, config.usuarioPassword);
      // Mismo mensaje para email o contraseña incorrectos: no se revela cuál falló.
      if (!emailOk || !passwordOk) throw new NoAutorizado('Email o contraseña incorrectos.');
      return jwt.sign({ sub: config.usuarioEmail }, config.jwtSecret, {
        algorithm: 'HS256',
        expiresIn: (config.duracionSesion ?? '7d') as jwt.SignOptions['expiresIn'],
      });
    },

    verificar(token: string): void {
      try {
        jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
      } catch {
        throw new NoAutorizado('Sesión inválida o vencida. Volvé a iniciar sesión.');
      }
    },
  };
}

export type AuthService = ReturnType<typeof crearAuthService>;
