// RN-02 / PA-02: todo el sistema opera en hora argentina.
// ADR-005: el "ahora" lo da un Reloj, para poder fijarlo en los tests.

export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

export interface Reloj {
  ahora(): Date;
}

export const relojDelSistema: Reloj = { ahora: () => new Date() };

/** Reloj detenido en un instante. Se usa en los tests ("control remoto del tiempo"). */
export function crearRelojFijo(instanteISO: string): Reloj & { fijar(instanteISO: string): void } {
  let instante = new Date(instanteISO);
  return {
    ahora: () => new Date(instante),
    fijar: (nuevo) => {
      instante = new Date(nuevo);
    },
  };
}

/** Fecha de calendario en Argentina ('AAAA-MM-DD') para un instante. */
export function fechaLocal(instante: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instante);
}

export function hoy(reloj: Reloj): string {
  return fechaLocal(reloj.ahora());
}

export function diasDelMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate(); // día 0 del mes siguiente = último de este
}

/** true si el texto es una fecha real con formato AAAA-MM-DD (rechaza 2026-02-30). */
export function esFechaValida(texto: unknown): texto is string {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [anio, mes, dia] = texto.split('-').map(Number);
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= diasDelMes(anio, mes);
}

export function esMesValido(texto: unknown): texto is string {
  return typeof texto === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(texto);
}

/** '2026-11-25' -> '2026-11' */
export function mesDe(fecha: string): string {
  return fecha.slice(0, 7);
}

/** Primer y último día de un mes 'AAAA-MM'. */
export function rangoDelMes(mes: string): { desde: string; hasta: string } {
  const [anio, numeroMes] = mes.split('-').map(Number);
  return { desde: `${mes}-01`, hasta: `${mes}-${String(diasDelMes(anio, numeroMes)).padStart(2, '0')}` };
}

/**
 * Suma meses a una fecha conservando el día; si ese día no existe en el mes
 * de destino, usa el último día (RN-06 / PA-05). Ej: 2026-01-31 + 1 = 2026-02-28.
 */
export function sumarMeses(fecha: string, meses: number): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const indice = anio * 12 + (mes - 1) + meses;
  const nuevoAnio = Math.floor(indice / 12);
  const nuevoMes = (indice % 12) + 1;
  const nuevoDia = Math.min(dia, diasDelMes(nuevoAnio, nuevoMes));
  return `${nuevoAnio}-${String(nuevoMes).padStart(2, '0')}-${String(nuevoDia).padStart(2, '0')}`;
}
