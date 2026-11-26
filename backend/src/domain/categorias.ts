// RN-01 y RN-03 / PA-03: listas fijas. Las categorías dependen del tipo.

export const TIPOS = ['gasto', 'ingreso'] as const;
export type TipoMovimiento = (typeof TIPOS)[number];

export const CATEGORIAS_GASTO = [
  'Comida', 'Transporte', 'Servicios', 'Alquiler', 'Salud', 'Ocio', 'Educación', 'Otros gastos',
] as const;
export const CATEGORIAS_INGRESO = ['Sueldo', 'Extras', 'Otros ingresos'] as const;
export const MEDIOS_DE_PAGO = ['Efectivo', 'Débito', 'Crédito', 'Transferencia'] as const;

export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number];
export type CategoriaIngreso = (typeof CATEGORIAS_INGRESO)[number];
export type Categoria = CategoriaGasto | CategoriaIngreso;
export type MedioDePago = (typeof MEDIOS_DE_PAGO)[number];

const incluye = (lista: readonly string[], valor: unknown): boolean =>
  typeof valor === 'string' && lista.includes(valor);

export const esTipo = (v: unknown): v is TipoMovimiento => incluye(TIPOS, v);
export const esMedioDePago = (v: unknown): v is MedioDePago => incluye(MEDIOS_DE_PAGO, v);
export const esCategoriaDeGasto = (v: unknown): v is CategoriaGasto => incluye(CATEGORIAS_GASTO, v);

export function esCategoriaDelTipo(categoria: unknown, tipo: TipoMovimiento): categoria is Categoria {
  return incluye(tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO, categoria);
}
