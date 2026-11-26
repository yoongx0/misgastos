// RN-01..RN-04 y RN-06: validación de un movimiento nuevo.
import { ErrorDeValidacion } from '../shared/errores.js';
import {
  esCategoriaDelTipo, esMedioDePago, esTipo,
  type Categoria, type MedioDePago, type TipoMovimiento,
} from './categorias.js';
import { esMontoValido } from './montos.js';
import { esFechaValida } from './tiempo.js';

export const DESCRIPCION_MAX = 60;
export const NOTA_MAX = 200;
export const CUOTAS_MIN = 2;
export const CUOTAS_MAX = 24;

export interface NuevoMovimiento {
  tipo: TipoMovimiento;
  descripcion: string;
  montoCentavos: number; // en cuotas: total de la compra
  categoria: Categoria;
  fecha: string; // AAAA-MM-DD
  medioDePago: MedioDePago;
  nota: string | null;
  cuotas: number | null; // null = no es compra en cuotas
}

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  descripcion: string;
  montoCentavos: number;
  categoria: Categoria;
  fecha: string;
  medioDePago: MedioDePago;
  nota: string | null;
  grupoId: string | null;
  cuotaNumero: number | null;
  cuotaTotal: number | null;
  creadoEn: string;
}

/**
 * Valida los datos recibidos (de cualquier origen) contra la spec.
 * Junta TODOS los errores para que el frontend los muestre juntos.
 * @param hoy fecha actual en Argentina (AAAA-MM-DD), dada por el Reloj.
 */
export function validarNuevoMovimiento(datos: unknown, hoy: string): NuevoMovimiento {
  const d = (typeof datos === 'object' && datos !== null ? datos : {}) as Record<string, unknown>;
  const errores: Record<string, string> = {};

  if (!esTipo(d.tipo)) errores.tipo = 'Debe ser "gasto" o "ingreso".';

  const descripcion = typeof d.descripcion === 'string' ? d.descripcion.trim() : '';
  if (descripcion.length === 0) errores.descripcion = 'Es obligatoria.';
  else if (descripcion.length > DESCRIPCION_MAX) errores.descripcion = `Máximo ${DESCRIPCION_MAX} caracteres.`;

  if (!esMontoValido(d.montoCentavos)) errores.montoCentavos = 'Debe ser un entero de centavos mayor a 0.';

  if (esTipo(d.tipo) && !esCategoriaDelTipo(d.categoria, d.tipo)) {
    errores.categoria = `La categoría no corresponde a un ${d.tipo}.`;
  }

  if (!esMedioDePago(d.medioDePago)) errores.medioDePago = 'Medio de pago inexistente.';

  if (!esFechaValida(d.fecha)) errores.fecha = 'Debe ser una fecha real con formato AAAA-MM-DD.';
  else if (d.fecha > hoy) errores.fecha = 'No puede ser una fecha futura.';

  let nota: string | null = null;
  if (d.nota !== undefined && d.nota !== null) {
    if (typeof d.nota !== 'string') errores.nota = 'Debe ser texto.';
    else if (d.nota.trim().length > NOTA_MAX) errores.nota = `Máximo ${NOTA_MAX} caracteres.`;
    else nota = d.nota.trim() || null;
  }

  // RN-06: cuotas solo para gastos con Crédito, de 2 a 24.
  let cuotas: number | null = null;
  if (d.cuotas !== undefined && d.cuotas !== null && d.cuotas !== 1) {
    if (!Number.isInteger(d.cuotas) || (d.cuotas as number) < CUOTAS_MIN || (d.cuotas as number) > CUOTAS_MAX) {
      errores.cuotas = `Debe ser un entero entre ${CUOTAS_MIN} y ${CUOTAS_MAX}.`;
    } else if (d.tipo !== 'gasto' || d.medioDePago !== 'Crédito') {
      errores.cuotas = 'Solo los gastos con Crédito se pueden pagar en cuotas.';
    } else {
      cuotas = d.cuotas as number;
    }
  }

  if (Object.keys(errores).length > 0) throw new ErrorDeValidacion(errores);

  return {
    tipo: d.tipo as TipoMovimiento,
    descripcion,
    montoCentavos: d.montoCentavos as number,
    categoria: d.categoria as Categoria,
    fecha: d.fecha as string,
    medioDePago: d.medioDePago as MedioDePago,
    nota,
    cuotas,
  };
}
