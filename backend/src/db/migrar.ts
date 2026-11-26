// ADR-002: migraciones SQL versionadas. Cada archivo se aplica una sola vez, en orden.
// Una migración ya aplicada nunca se modifica: se agrega una nueva (AGENTS.md).
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Db } from './conexion.js';

// src/db/ y dist/db/ están a la misma profundidad: en los dos casos es backend/migrations.
const CARPETA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../migrations');

export async function migrar(db: Db): Promise<string[]> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migraciones (
      nombre     TEXT PRIMARY KEY,
      aplicada_en TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  const { rows } = await db.query<{ nombre: string }>('SELECT nombre FROM migraciones');
  const aplicadas = new Set(rows.map((r) => r.nombre));

  const archivos = (await readdir(CARPETA)).filter((a) => a.endsWith('.sql')).sort();
  const nuevas: string[] = [];
  for (const archivo of archivos) {
    if (aplicadas.has(archivo)) continue;
    // El nombre va dentro del SQL de la transacción, así que se valida que sea un nombre de migración propio.
    if (!/^\d{3}_[a-z0-9_]+\.sql$/.test(archivo)) throw new Error(`Nombre de migración inválido: ${archivo}`);
    const sql = await readFile(path.join(CARPETA, archivo), 'utf8');
    // La migración y su registro van en la misma transacción: si algo falla, no queda a medias.
    await db.exec(`BEGIN;\n${sql}\nINSERT INTO migraciones (nombre) VALUES ('${archivo}');\nCOMMIT;`);
    nuevas.push(archivo);
  }
  return nuevas;
}
