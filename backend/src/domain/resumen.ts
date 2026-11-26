// RN-05: resumen mensual. Es la función refactorizada en el TP de refactoring (Módulo 2),
// adaptada al contrato de la API (montoCentavos).
import type { Categoria, TipoMovimiento } from './categorias.js';
import { esMontoValido } from './montos.js';
import { mesDe } from './tiempo.js';

interface MovimientoParaResumen {
  tipo: TipoMovimiento;
  montoCentavos: number;
  categoria: Categoria;
  fecha: string;
}

export interface GastoPorCategoria {
  categoria: Categoria;
  total: number;
  porcentaje: number;
}

export interface Resumen {
  mes: string;
  ingresos: number;
  gastos: number;
  saldo: number;
  gastosPorCategoria: GastoPorCategoria[];
}

export function calcularResumenDelMes(movimientos: MovimientoParaResumen[], mes: string): Resumen {
  let ingresos = 0;
  let gastos = 0;
  const totalPorCategoria = new Map<Categoria, number>();

  for (const m of movimientos) {
    if (mesDe(m.fecha) !== mes || !esMontoValido(m.montoCentavos)) continue;
    if (m.tipo === 'ingreso') {
      ingresos += m.montoCentavos;
    } else if (m.tipo === 'gasto') {
      gastos += m.montoCentavos;
      totalPorCategoria.set(m.categoria, (totalPorCategoria.get(m.categoria) ?? 0) + m.montoCentavos);
    }
  }

  const gastosPorCategoria = [...totalPorCategoria]
    .map(([categoria, total]) => ({
      categoria,
      total,
      porcentaje: gastos > 0 ? Math.round((total / gastos) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return { mes, ingresos, gastos, saldo: ingresos - gastos, gastosPorCategoria };
}
