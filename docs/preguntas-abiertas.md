# Preguntas abiertas
La spec no las define; no se implementan hasta resolverlas. Respondé "OK" para aceptar la propuesta provisoria o indicá el cambio.

## Abiertas
| ID | Pregunta | Propuesta provisoria |
|---|---|---|
| PA-10 | **Editar movimientos:** ¿se puede editar una cuota sola? Si cambia el monto de una cuota, ¿se recalculan las demás? | Una cuota no se edita sola: para cambiar una compra en cuotas se elimina y se vuelve a cargar. Los movimientos sueltos se editan con las mismas validaciones que al crearlos. |
| PA-11 | **Ingresos recurrentes:** ¿el sueldo se carga solo cada mes? | No en el MVP: se carga a mano. |
| PA-12 | **Moneda extranjera:** ¿hay que registrar gastos en dólares? | No en el MVP: todo en pesos. |
| PA-13 | **Exportar:** ¿hace falta exportar los movimientos (CSV / Excel)? | CSV del mes en una próxima versión. |
| PA-14 | **Sesión:** ¿cuánto dura la sesión antes de pedir login otra vez? | 7 días. |

## Resueltas
| ID | Decisión | Fecha | Reflejada en |
|---|---|---|---|
| PA-01 | Montos en centavos enteros; el formato en pesos es solo para mostrar | 2026-11-20 | RN-04, `domain/montos.ts` |
| PA-02 | Zona horaria `America/Argentina/Buenos_Aires`; no se aceptan fechas futuras | 2026-11-20 | RN-02, `domain/tiempo.ts` |
| PA-03 | Categorías fijas y distintas para gastos e ingresos | 2026-11-20 | RN-03, `domain/categorias.ts` |
| PA-04 | Cuotas solo para gastos con Crédito, de 2 a 24 | 2026-11-22 | RN-06, `domain/cuotas.ts` |
| PA-05 | Día inexistente → último día del mes; centavos sobrantes en la primera cuota | 2026-11-22 | RN-06, `domain/cuotas.ts` |
| PA-06 | Eliminar una cuota elimina todo el grupo | 2026-11-22 | RN-07, `movimientoService.ts` |
| PA-07 | El presupuesto es un monto fijo por categoría que vale para todos los meses | 2026-11-24 | RN-08 |
| PA-08 | Umbrales: ALERTA desde 80%; exactamente 100% sigue siendo ALERTA; EXCEDIDO solo si pasa el 100% | 2026-11-24 | RN-08, `domain/presupuesto.ts` |
| PA-09 | Usuario único con login; credenciales en variables de entorno, sin registro | 2026-11-24 | RN-09, ADR-004 |
