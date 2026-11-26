// Lee y valida la configuración. Los secretos nunca tienen valor por defecto:
// si faltan, el servidor no arranca (mejor un error claro que una app abierta).
import 'dotenv/config';

function requerida(nombre: string): string {
  const valor = process.env[nombre]?.trim();
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}. Copiá backend/.env.example a backend/.env y completala.`);
  return valor;
}

export function leerConfig() {
  const jwtSecret = requerida('JWT_SECRET');
  if (jwtSecret.length < 32) throw new Error('JWT_SECRET tiene que tener al menos 32 caracteres.');

  return {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: process.env.DATABASE_URL?.trim() ?? '', // vacío = PGlite local (ADR-003)
    dataDir: process.env.PGLITE_DIR ?? './.data',
    corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((o) => o.trim()),
    auth: {
      jwtSecret,
      usuarioEmail: requerida('USUARIO_EMAIL'),
      usuarioPassword: requerida('USUARIO_PASSWORD'),
    },
  };
}
