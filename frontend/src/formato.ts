// Conversión entre lo que escribe y ve el usuario (pesos) y lo que maneja la API (centavos).
// RN-04: nunca se usan decimales para el dinero: el texto se convierte a centavos sin pasar por float.

const formatoPesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

/** 1250050 -> "$ 12.500,50" */
export function formatearMonto(centavos: number): string {
  return formatoPesos.format(centavos / 100);
}

/**
 * Convierte lo que escribe el usuario en centavos. Devuelve null si no es un monto válido.
 * Acepta formato argentino: "12500", "12.500", "12.500,50", "12500,5", y también "12500.50".
 */
export function parsearMontoEnPesos(texto: string): number | null {
  let t = texto.trim().replace(/^\$\s*/, '').replace(/\s/g, '');
  if (t === '') return null;

  if (t.includes(',')) {
    // La coma es el decimal; los puntos, separadores de miles.
    if (!/^\d{1,3}(\.\d{3})*,\d{1,2}$|^\d+,\d{1,2}$/.test(t)) return null;
    t = t.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    t = t.replace(/\./g, ''); // "12.500" = doce mil quinientos
  } else if (!/^\d+(\.\d{1,2})?$/.test(t)) {
    return null;
  }

  const [enteros, decimales = ''] = t.split('.');
  const centavos = Number(enteros) * 100 + Number(decimales.padEnd(2, '0'));
  return Number.isSafeInteger(centavos) && centavos > 0 ? centavos : null;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** '2026-11' -> 'noviembre 2026' */
export function nombreDelMes(mes: string): string {
  const [anio, numero] = mes.split('-').map(Number);
  return `${MESES[numero - 1]} ${anio}`;
}

export function sumarMes(mes: string, cantidad: number): string {
  const [anio, numero] = mes.split('-').map(Number);
  const indice = anio * 12 + (numero - 1) + cantidad;
  return `${Math.floor(indice / 12)}-${String((indice % 12) + 1).padStart(2, '0')}`;
}

/** Fecha de hoy en Argentina (RN-02), no la de UTC. */
export function hoyEnArgentina(ahora = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(ahora);
}

/** '2026-11-20' -> '20/11' */
export function fechaCorta(fecha: string): string {
  const [, mes, dia] = fecha.split('-');
  return `${dia}/${mes}`;
}
