// HU-03 y HU-06: resumen del mes y estado de los presupuestos.
import { esCategoriaDeGasto } from '../domain/categorias.js';
import { esMontoValido } from '../domain/montos.js';
import { evaluarPresupuestos, type EstadoPresupuesto, type Presupuesto } from '../domain/presupuesto.js';
import { calcularResumenDelMes, type Resumen } from '../domain/resumen.js';
import { rangoDelMes } from '../domain/tiempo.js';
import type { MovimientoRepository } from '../repositories/movimientoRepository.js';
import type { PresupuestoRepository } from '../repositories/presupuestoRepository.js';
import { ErrorDeValidacion, NoEncontrado } from '../shared/errores.js';
import { validarMes } from './movimientoService.js';

export function crearResumenService(movimientos: MovimientoRepository, presupuestos: PresupuestoRepository) {
  async function resumenDelMes(mes: unknown): Promise<Resumen> {
    const mesValido = validarMes(mes);
    const { desde, hasta } = rangoDelMes(mesValido);
    return calcularResumenDelMes(await movimientos.listarEntre(desde, hasta), mesValido);
  }

  return {
    resumenDelMes,

    /** RN-08: estado de cada presupuesto con lo gastado en el mes. */
    async presupuestosDelMes(mes: unknown): Promise<EstadoPresupuesto[]> {
      const resumen = await resumenDelMes(mes);
      const gastado = new Map(resumen.gastosPorCategoria.map((g) => [g.categoria as string, g.total]));
      return evaluarPresupuestos(await presupuestos.listar(), gastado);
    },

    async guardarPresupuesto(categoria: string, datos: unknown): Promise<Presupuesto> {
      const monto = (typeof datos === 'object' && datos !== null ? datos : {}) as Record<string, unknown>;
      const errores: Record<string, string> = {};
      if (!esCategoriaDeGasto(categoria)) errores.categoria = 'Solo las categorías de gasto tienen presupuesto.';
      if (!esMontoValido(monto.montoMensualCentavos)) errores.montoMensualCentavos = 'Debe ser un entero de centavos mayor a 0.';
      if (Object.keys(errores).length > 0) throw new ErrorDeValidacion(errores);
      return presupuestos.guardar({ categoria: categoria as Presupuesto['categoria'], montoMensualCentavos: monto.montoMensualCentavos as number });
    },

    async eliminarPresupuesto(categoria: string): Promise<void> {
      if ((await presupuestos.eliminar(categoria)) === 0) throw new NoEncontrado('No hay presupuesto para esa categoría.');
    },
  };
}

export type ResumenService = ReturnType<typeof crearResumenService>;
