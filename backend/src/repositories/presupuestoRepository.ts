// SQL de presupuestos. Sin reglas de negocio.
import type { Db } from '../db/conexion.js';
import type { Presupuesto } from '../domain/presupuesto.js';

interface Fila {
  categoria: string;
  monto_mensual_centavos: string | number;
}

const aPresupuesto = (f: Fila): Presupuesto => ({
  categoria: f.categoria as Presupuesto['categoria'],
  montoMensualCentavos: Number(f.monto_mensual_centavos),
});

export function crearPresupuestoRepository(db: Db) {
  return {
    async listar(): Promise<Presupuesto[]> {
      const { rows } = await db.query<Fila>(
        'SELECT categoria, monto_mensual_centavos FROM presupuestos ORDER BY categoria'
      );
      return rows.map(aPresupuesto);
    },

    /** Crea o reemplaza el presupuesto de una categoría. */
    async guardar(p: Presupuesto): Promise<Presupuesto> {
      const { rows } = await db.query<Fila>(
        `INSERT INTO presupuestos (categoria, monto_mensual_centavos) VALUES ($1, $2)
         ON CONFLICT (categoria) DO UPDATE
           SET monto_mensual_centavos = EXCLUDED.monto_mensual_centavos, actualizado_en = now()
         RETURNING categoria, monto_mensual_centavos`,
        [p.categoria, p.montoMensualCentavos]
      );
      return aPresupuesto(rows[0]);
    },

    async eliminar(categoria: string): Promise<number> {
      const { rows } = await db.query('DELETE FROM presupuestos WHERE categoria = $1 RETURNING categoria', [categoria]);
      return rows.length;
    },
  };
}

export type PresupuestoRepository = ReturnType<typeof crearPresupuestoRepository>;
