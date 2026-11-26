// Casos de uso de movimientos (HU-01, HU-02, HU-04, HU-05). No sabe de HTTP ni de SQL.
import { randomUUID } from 'node:crypto';
import { generarCuotas } from '../domain/cuotas.js';
import { validarNuevoMovimiento, type Movimiento } from '../domain/movimiento.js';
import { esMesValido, hoy, rangoDelMes, type Reloj } from '../domain/tiempo.js';
import type { MovimientoAGuardar, MovimientoRepository } from '../repositories/movimientoRepository.js';
import { ErrorDeValidacion, NoEncontrado } from '../shared/errores.js';

const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validarMes(mes: unknown): string {
  if (!esMesValido(mes)) throw new ErrorDeValidacion({ mes: 'Debe tener formato AAAA-MM.' });
  return mes;
}

export function crearMovimientoService(repo: MovimientoRepository, reloj: Reloj) {
  return {
    /** HU-01 / HU-04: registra un movimiento, o todas las cuotas de una compra (RN-06). */
    async registrar(datos: unknown): Promise<Movimiento[]> {
      const nuevo = validarNuevoMovimiento(datos, hoy(reloj));
      const comunes = { tipo: nuevo.tipo, categoria: nuevo.categoria, medioDePago: nuevo.medioDePago, nota: nuevo.nota };

      let aGuardar: MovimientoAGuardar[];
      if (nuevo.cuotas) {
        const grupoId = randomUUID();
        aGuardar = generarCuotas({ ...nuevo, cuotas: nuevo.cuotas }).map((c) => ({
          ...comunes, ...c, id: randomUUID(), grupoId,
        }));
      } else {
        aGuardar = [{
          ...comunes, id: randomUUID(), descripcion: nuevo.descripcion, montoCentavos: nuevo.montoCentavos,
          fecha: nuevo.fecha, grupoId: null, cuotaNumero: null, cuotaTotal: null,
        }];
      }
      return repo.guardar(aGuardar);
    },

    /** HU-02 */
    async listarDelMes(mes: unknown): Promise<Movimiento[]> {
      const { desde, hasta } = rangoDelMes(validarMes(mes));
      return repo.listarEntre(desde, hasta);
    },

    /** HU-05 / RN-07: eliminar una cuota elimina todo el grupo. Devuelve cuántos se borraron. */
    async eliminar(id: string): Promise<number> {
      // Un id con otro formato no existe: se responde 404 en vez de dejar que la base falle con un 500.
      const movimiento = FORMATO_UUID.test(id) ? await repo.buscarPorId(id) : null;
      if (!movimiento) throw new NoEncontrado('El movimiento no existe.');
      return movimiento.grupoId ? repo.eliminarGrupo(movimiento.grupoId) : repo.eliminarPorId(id);
    },
  };
}

export type MovimientoService = ReturnType<typeof crearMovimientoService>;
