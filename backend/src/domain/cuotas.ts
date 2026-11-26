// RN-06 / PA-04, PA-05: división de una compra en cuotas.
import { sumarMeses } from './tiempo.js';

export interface Cuota {
  descripcion: string;
  montoCentavos: number;
  fecha: string;
  cuotaNumero: number;
  cuotaTotal: number;
}

/**
 * Divide una compra en cuotas mensuales.
 * - Partes iguales en centavos; el resto va a la PRIMERA cuota.
 * - La cuota n cae el mismo día, n-1 meses después (o el último día si ese día no existe).
 */
export function generarCuotas(compra: {
  descripcion: string;
  montoCentavos: number;
  fecha: string;
  cuotas: number;
}): Cuota[] {
  const { descripcion, montoCentavos, fecha, cuotas } = compra;
  const base = Math.floor(montoCentavos / cuotas);
  const resto = montoCentavos - base * cuotas;

  return Array.from({ length: cuotas }, (_, i) => ({
    descripcion: `${descripcion} (cuota ${i + 1}/${cuotas})`,
    montoCentavos: i === 0 ? base + resto : base,
    fecha: sumarMeses(fecha, i),
    cuotaNumero: i + 1,
    cuotaTotal: cuotas,
  }));
}
