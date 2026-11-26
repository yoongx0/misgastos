// Único lugar que habla SQL sobre movimientos. Sin reglas de negocio.
// Todas las consultas usan parámetros ($1, $2…): nunca se concatena texto del usuario.
import type { Db } from '../db/conexion.js';
import type { Movimiento } from '../domain/movimiento.js';

interface Fila {
  id: string;
  tipo: string;
  descripcion: string;
  monto_centavos: string | number; // pg devuelve BIGINT como texto
  categoria: string;
  fecha: string;
  medio_de_pago: string;
  nota: string | null;
  grupo_id: string | null;
  cuota_numero: number | null;
  cuota_total: number | null;
  creado_en: Date | string;
}

const COLUMNAS = `id, tipo, descripcion, monto_centavos, categoria,
  to_char(fecha, 'YYYY-MM-DD') AS fecha, medio_de_pago, nota,
  grupo_id, cuota_numero, cuota_total, creado_en`;

function aMovimiento(f: Fila): Movimiento {
  return {
    id: f.id,
    tipo: f.tipo as Movimiento['tipo'],
    descripcion: f.descripcion,
    montoCentavos: Number(f.monto_centavos),
    categoria: f.categoria as Movimiento['categoria'],
    fecha: f.fecha,
    medioDePago: f.medio_de_pago as Movimiento['medioDePago'],
    nota: f.nota,
    grupoId: f.grupo_id,
    cuotaNumero: f.cuota_numero,
    cuotaTotal: f.cuota_total,
    creadoEn: new Date(f.creado_en).toISOString(),
  };
}

export type MovimientoAGuardar = Omit<Movimiento, 'creadoEn'>;

export function crearMovimientoRepository(db: Db) {
  return {
    /** Inserta uno o varios movimientos en UNA sentencia: o se guardan todas las cuotas o ninguna. */
    async guardar(movimientos: MovimientoAGuardar[]): Promise<Movimiento[]> {
      const params: unknown[] = [];
      const filas = movimientos.map((m) => {
        const base = params.length;
        params.push(m.id, m.tipo, m.descripcion, m.montoCentavos, m.categoria, m.fecha,
          m.medioDePago, m.nota, m.grupoId, m.cuotaNumero, m.cuotaTotal);
        return `(${Array.from({ length: 11 }, (_, i) => `$${base + i + 1}`).join(', ')})`;
      });
      const { rows } = await db.query<Fila>(
        `INSERT INTO movimientos
           (id, tipo, descripcion, monto_centavos, categoria, fecha, medio_de_pago, nota, grupo_id, cuota_numero, cuota_total)
         VALUES ${filas.join(', ')}
         RETURNING ${COLUMNAS}`,
        params
      );
      return rows.map(aMovimiento).sort((a, b) => (a.cuotaNumero ?? 0) - (b.cuotaNumero ?? 0));
    },

    /** Movimientos entre dos fechas inclusive, del más reciente al más antiguo. */
    async listarEntre(desde: string, hasta: string): Promise<Movimiento[]> {
      const { rows } = await db.query<Fila>(
        `SELECT ${COLUMNAS} FROM movimientos
         WHERE fecha BETWEEN $1 AND $2
         ORDER BY fecha DESC, creado_en DESC, cuota_numero`,
        [desde, hasta]
      );
      return rows.map(aMovimiento);
    },

    async buscarPorId(id: string): Promise<Movimiento | null> {
      const { rows } = await db.query<Fila>(`SELECT ${COLUMNAS} FROM movimientos WHERE id = $1`, [id]);
      return rows[0] ? aMovimiento(rows[0]) : null;
    },

    async eliminarPorId(id: string): Promise<number> {
      const { rows } = await db.query('DELETE FROM movimientos WHERE id = $1 RETURNING id', [id]);
      return rows.length;
    },

    async eliminarGrupo(grupoId: string): Promise<number> {
      const { rows } = await db.query('DELETE FROM movimientos WHERE grupo_id = $1 RETURNING id', [grupoId]);
      return rows.length;
    },
  };
}

export type MovimientoRepository = ReturnType<typeof crearMovimientoRepository>;
