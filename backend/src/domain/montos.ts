// RN-04 / PA-01: montos en centavos enteros, mayores a 0.
// Se usa isSafeInteger: por encima de 2^53 los enteros de JavaScript pierden precisión.

export function esMontoValido(centavos: unknown): centavos is number {
  return typeof centavos === 'number' && Number.isSafeInteger(centavos) && centavos > 0;
}
