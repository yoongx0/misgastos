# Contrato de la API — v0.3

Base: `/api`. Formato JSON. Montos siempre en **centavos enteros**; fechas como texto `AAAA-MM-DD`; meses como `AAAA-MM`.

Todas las rutas, salvo `GET /health` y `POST /login`, requieren el header `Authorization: Bearer <token>` (RN-09).

## Errores
Mismo formato en toda la API:
```json
{ "error": "Datos inválidos", "detalles": { "montoCentavos": "Debe ser un entero de centavos mayor a 0." } }
```
| Código | Cuándo |
|---|---|
| 400 | Datos inválidos (`detalles` dice qué campo y por qué) o JSON mal formado |
| 401 | Sin token, token inválido o vencido, o login incorrecto |
| 404 | El recurso no existe |
| 500 | Error inesperado (sin detalles internos) |

## Endpoints

| Método | Ruta | Body | Respuesta | HU / RN |
|---|---|---|---|---|
| GET | `/health` | — | `200 { status: "ok" }` | — |
| POST | `/login` | `{ email, password }` | `200 { token }` · 400 · 401 | HU-07 / RN-09 |
| GET | `/catalogos` | — | `200 { categoriasGasto, categoriasIngreso, mediosDePago }` | RN-01, RN-03 |
| GET | `/movimientos?mes=AAAA-MM` | — | `200 Movimiento[]` (más reciente primero) · 400 | HU-02 |
| POST | `/movimientos` | `NuevoMovimiento` | `201 { creados: Movimiento[] }` · 400 | HU-01, HU-04 / RN-01..RN-04, RN-06 |
| DELETE | `/movimientos/:id` | — | `204` · 404 | HU-05 / RN-07 |
| GET | `/resumen?mes=AAAA-MM` | — | `200 Resumen` · 400 | HU-03 / RN-05 |
| GET | `/presupuestos?mes=AAAA-MM` | — | `200 EstadoPresupuesto[]` · 400 | HU-06 / RN-08 |
| PUT | `/presupuestos/:categoria` | `{ montoMensualCentavos }` | `200 Presupuesto` · 400 | HU-06 / RN-08 |
| DELETE | `/presupuestos/:categoria` | — | `204` · 404 | HU-06 |

## Tipos
```ts
type NuevoMovimiento = {
  tipo: 'gasto' | 'ingreso';
  descripcion: string;          // 1 a 60 caracteres
  montoCentavos: number;        // entero > 0; en cuotas, es el TOTAL de la compra
  categoria: string;            // según el tipo (RN-03)
  fecha: string;                // AAAA-MM-DD, no futura
  medioDePago: 'Efectivo' | 'Débito' | 'Crédito' | 'Transferencia';
  nota?: string | null;         // hasta 200 caracteres
  cuotas?: number;              // 2 a 24; solo gasto + Crédito (RN-06)
};

type Movimiento = Omit<NuevoMovimiento, 'cuotas'> & {
  id: string;
  nota: string | null;
  grupoId: string | null;       // mismo valor en todas las cuotas de una compra
  cuotaNumero: number | null;
  cuotaTotal: number | null;
  creadoEn: string;             // ISO 8601
};

type Resumen = {
  mes: string;
  ingresos: number; gastos: number; saldo: number;
  gastosPorCategoria: { categoria: string; total: number; porcentaje: number }[];
};

type EstadoPresupuesto = {
  categoria: string;
  montoMensualCentavos: number;
  gastadoCentavos: number;
  porcentaje: number;           // redondeado al entero
  estado: 'OK' | 'ALERTA' | 'EXCEDIDO';
};
```
