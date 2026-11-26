import { describe, expect, it } from 'vitest';
import { validarNuevoMovimiento } from '../src/domain/movimiento.js';
import { ErrorDeValidacion } from '../src/shared/errores.js';

const HOY = '2026-11-25';
const gasto = {
  tipo: 'gasto',
  descripcion: 'Supermercado',
  montoCentavos: 1_250_050,
  categoria: 'Comida',
  fecha: '2026-11-20',
  medioDePago: 'Débito',
};

/** Devuelve los campos con error (o [] si es válido). */
function camposConError(datos: unknown): string[] {
  try {
    validarNuevoMovimiento(datos, HOY);
    return [];
  } catch (e) {
    if (e instanceof ErrorDeValidacion) return Object.keys(e.detalles).sort();
    throw e;
  }
}

describe('[RN-01] movimiento válido', () => {
  it('acepta un gasto correcto y limpia espacios', () => {
    const r = validarNuevoMovimiento({ ...gasto, descripcion: '  Super  ', nota: '  del mes ' }, HOY);
    expect(r).toMatchObject({ descripcion: 'Super', nota: 'del mes', cuotas: null });
  });
  it('acepta un ingreso con categoría de ingreso', () => {
    expect(camposConError({ ...gasto, tipo: 'ingreso', categoria: 'Sueldo', medioDePago: 'Transferencia' })).toEqual([]);
  });
  it('nota vacía se guarda como null', () => {
    expect(validarNuevoMovimiento({ ...gasto, nota: '   ' }, HOY).nota).toBeNull();
  });
});

describe('[RN-01][RN-04] datos inválidos', () => {
  it('junta todos los errores a la vez', () => {
    expect(camposConError({ tipo: 'x', descripcion: '', montoCentavos: -1, categoria: 'Comida', fecha: 'ayer', medioDePago: 'Bitcoin' }))
      .toEqual(['descripcion', 'fecha', 'medioDePago', 'montoCentavos', 'tipo']);
  });
  it.each([0, -100, 10.5, '5000', Number.NaN, Number.MAX_SAFE_INTEGER + 1])('rechaza el monto %s', (monto) => {
    expect(camposConError({ ...gasto, montoCentavos: monto })).toEqual(['montoCentavos']);
  });
  it('rechaza descripción de 61 caracteres y acepta 60', () => {
    expect(camposConError({ ...gasto, descripcion: 'x'.repeat(61) })).toEqual(['descripcion']);
    expect(camposConError({ ...gasto, descripcion: 'x'.repeat(60) })).toEqual([]);
  });
  it('rechaza nota de más de 200 caracteres', () => {
    expect(camposConError({ ...gasto, nota: 'x'.repeat(201) })).toEqual(['nota']);
  });
  it('un body que no es objeto no rompe: devuelve errores', () => {
    expect(camposConError(null).length).toBeGreaterThan(0);
    expect(camposConError('hola').length).toBeGreaterThan(0);
  });
});

describe('[RN-03] la categoría tiene que corresponder al tipo', () => {
  it('un gasto no puede ser "Sueldo"', () => {
    expect(camposConError({ ...gasto, categoria: 'Sueldo' })).toEqual(['categoria']);
  });
  it('un ingreso no puede ser "Comida"', () => {
    expect(camposConError({ ...gasto, tipo: 'ingreso', categoria: 'Comida' })).toEqual(['categoria']);
  });
});

describe('[RN-02] fecha', () => {
  it('hoy se acepta (límite)', () => {
    expect(camposConError({ ...gasto, fecha: HOY })).toEqual([]);
  });
  it('mañana es futura y se rechaza', () => {
    expect(camposConError({ ...gasto, fecha: '2026-11-26' })).toEqual(['fecha']);
  });
  it('una fecha inexistente se rechaza', () => {
    expect(camposConError({ ...gasto, fecha: '2026-02-30' })).toEqual(['fecha']);
  });
});

describe('[RN-06] cuotas', () => {
  const compra = { ...gasto, medioDePago: 'Crédito', categoria: 'Otros gastos' };
  it('acepta de 2 a 24 cuotas en un gasto con Crédito', () => {
    expect(validarNuevoMovimiento({ ...compra, cuotas: 2 }, HOY).cuotas).toBe(2);
    expect(validarNuevoMovimiento({ ...compra, cuotas: 24 }, HOY).cuotas).toBe(24);
  });
  it('1 cuota equivale a un pago normal', () => {
    expect(validarNuevoMovimiento({ ...compra, cuotas: 1 }, HOY).cuotas).toBeNull();
  });
  it.each([0, 25, 3.5, '3'])('rechaza %s cuotas', (cuotas) => {
    expect(camposConError({ ...compra, cuotas })).toEqual(['cuotas']);
  });
  it('rechaza cuotas con Débito o en un ingreso', () => {
    expect(camposConError({ ...gasto, cuotas: 3 })).toEqual(['cuotas']);
    expect(camposConError({ ...compra, tipo: 'ingreso', categoria: 'Extras', cuotas: 3 })).toEqual(['cuotas']);
  });
});
