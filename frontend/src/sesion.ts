// Guarda el token en el navegador. localStorage puede fallar (modo privado, almacenamiento lleno,
// datos dañados): si falla, la app sigue funcionando y solo pide login otra vez.
const CLAVE = 'misgastos.token';

export function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export function guardarToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(CLAVE, token);
    else localStorage.removeItem(CLAVE);
  } catch {
    // sin almacenamiento disponible: la sesión dura lo que dure la pestaña
  }
}
