// ADR-001 / ADR-003: Postgres real en producción (pg + Neon); PGlite en desarrollo y tests.
// Las dos opciones exponen la misma interfaz mínima, así el resto del código no sabe cuál usa.
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';

export interface Db {
  /** Una consulta, siempre con parámetros ($1, $2…). */
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  /** Varias sentencias sin parámetros (solo para migraciones). */
  exec(sql: string): Promise<void>;
  cerrar(): Promise<void>;
}

/**
 * @param databaseUrl cadena de conexión de Postgres. Si está vacía se usa PGlite.
 * @param dataDir carpeta para PGlite (undefined = en memoria, para tests).
 */
export async function conectar(databaseUrl: string, dataDir?: string): Promise<Db> {
  if (databaseUrl) {
    const pool = new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return {
      query: async (sql, params) => pool.query(sql, params as unknown[]) as never,
      exec: async (sql) => {
        await pool.query(sql);
      },
      cerrar: () => pool.end(),
    };
  }

  const lite = new PGlite(dataDir);
  return {
    query: async (sql, params) => lite.query(sql, params) as never,
    exec: async (sql) => {
      await lite.exec(sql);
    },
    cerrar: () => lite.close(),
  };
}
