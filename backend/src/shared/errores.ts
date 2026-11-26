// Errores con significado de negocio. El middleware de errores los traduce a HTTP.

/** 400: datos inválidos, con el detalle de cada campo. */
export class ErrorDeValidacion extends Error {
  constructor(public readonly detalles: Record<string, string>) {
    super('Datos inválidos');
    this.name = 'ErrorDeValidacion';
  }
}

/** 404: el recurso no existe. */
export class NoEncontrado extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'NoEncontrado';
  }
}

/** 401: sin sesión válida o credenciales incorrectas. */
export class NoAutorizado extends Error {
  constructor(mensaje = 'No autorizado') {
    super(mensaje);
    this.name = 'NoAutorizado';
  }
}
