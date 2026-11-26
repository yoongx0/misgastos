// Cliente de la API. Es "Postman con botones": arma el pedido, lo manda y devuelve la respuesta.
// Las reglas viven en el backend; acá solo se traducen los errores a mensajes claros.
import type { Catalogos, EstadoPresupuesto, Movimiento, NuevoMovimiento, Resumen } from './tipos';

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ErrorApi extends Error {
  constructor(public status: number, mensaje: string, public detalles: Record<string, string> = {}) {
    super(mensaje);
  }
}

let token: string | null = null;
let alVencerSesion: () => void = () => {};

export function configurarSesion(nuevoToken: string | null, onVencida: () => void) {
  token = nuevoToken;
  alVencerSesion = onVencida;
}

async function pedir<T>(metodo: string, ruta: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${ruta}`, {
      method: metodo,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.');
  }

  if (res.status === 204) return undefined as T;
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && ruta !== '/login') alVencerSesion();
    throw new ErrorApi(res.status, datos.error ?? `Error ${res.status}`, datos.detalles);
  }
  return datos as T;
}

export const api = {
  login: (email: string, password: string) => pedir<{ token: string }>('POST', '/login', { email, password }),
  catalogos: () => pedir<Catalogos>('GET', '/catalogos'),
  movimientos: (mes: string) => pedir<Movimiento[]>('GET', `/movimientos?mes=${mes}`),
  crearMovimiento: (m: NuevoMovimiento) => pedir<{ creados: Movimiento[] }>('POST', '/movimientos', m),
  eliminarMovimiento: (id: string) => pedir<void>('DELETE', `/movimientos/${encodeURIComponent(id)}`),
  resumen: (mes: string) => pedir<Resumen>('GET', `/resumen?mes=${mes}`),
  presupuestos: (mes: string) => pedir<EstadoPresupuesto[]>('GET', `/presupuestos?mes=${mes}`),
  guardarPresupuesto: (categoria: string, montoMensualCentavos: number) =>
    pedir<unknown>('PUT', `/presupuestos/${encodeURIComponent(categoria)}`, { montoMensualCentavos }),
  eliminarPresupuesto: (categoria: string) => pedir<void>('DELETE', `/presupuestos/${encodeURIComponent(categoria)}`),
};
