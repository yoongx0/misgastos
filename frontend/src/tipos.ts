// Contrato de la API (docs/api.md). Montos en centavos; fechas como texto AAAA-MM-DD.

export type TipoMovimiento = 'gasto' | 'ingreso';

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  descripcion: string;
  montoCentavos: number;
  categoria: string;
  fecha: string;
  medioDePago: string;
  nota: string | null;
  grupoId: string | null;
  cuotaNumero: number | null;
  cuotaTotal: number | null;
  creadoEn: string;
}

export interface NuevoMovimiento {
  tipo: TipoMovimiento;
  descripcion: string;
  montoCentavos: number;
  categoria: string;
  fecha: string;
  medioDePago: string;
  nota?: string | null;
  cuotas?: number;
}

export interface Resumen {
  mes: string;
  ingresos: number;
  gastos: number;
  saldo: number;
  gastosPorCategoria: { categoria: string; total: number; porcentaje: number }[];
}

export interface EstadoPresupuesto {
  categoria: string;
  montoMensualCentavos: number;
  gastadoCentavos: number;
  porcentaje: number;
  estado: 'OK' | 'ALERTA' | 'EXCEDIDO';
}

export interface Catalogos {
  categoriasGasto: string[];
  categoriasIngreso: string[];
  mediosDePago: string[];
}
