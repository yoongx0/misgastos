// RN-08 / PA-07, PA-08: estado de un presupuesto mensual por categoría.
import type { CategoriaGasto } from './categorias.js';

export type Estado = 'OK' | 'ALERTA' | 'EXCEDIDO';

export const UMBRAL_ALERTA_PCT = 80;

export interface Presupuesto {
  categoria: CategoriaGasto;
  montoMensualCentavos: number;
}

export interface EstadoPresupuesto extends Presupuesto {
  gastadoCentavos: number;
  porcentaje: number; // redondeado, solo para mostrar
  estado: Estado;
}

/**
 * El estado se decide con la cuenta EXACTA (en enteros), no con el porcentaje redondeado:
 * 79,6% se muestra como "80%" pero sigue siendo OK.
 */
export function evaluarPresupuesto(presupuesto: Presupuesto, gastadoCentavos: number): EstadoPresupuesto {
  const { montoMensualCentavos } = presupuesto;
  let estado: Estado = 'OK';
  if (gastadoCentavos > montoMensualCentavos) estado = 'EXCEDIDO';
  else if (gastadoCentavos * 100 >= montoMensualCentavos * UMBRAL_ALERTA_PCT) estado = 'ALERTA';

  return {
    ...presupuesto,
    gastadoCentavos,
    porcentaje: Math.round((gastadoCentavos / montoMensualCentavos) * 100),
    estado,
  };
}

/** Evalúa todos los presupuestos con lo gastado por categoría en el mes. Los más comprometidos primero. */
export function evaluarPresupuestos(
  presupuestos: Presupuesto[],
  gastadoPorCategoria: Map<string, number>
): EstadoPresupuesto[] {
  return presupuestos
    .map((p) => evaluarPresupuesto(p, gastadoPorCategoria.get(p.categoria) ?? 0))
    .sort((a, b) => b.porcentaje - a.porcentaje || a.categoria.localeCompare(b.categoria, 'es'));
}
