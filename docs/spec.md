# Especificación — MisGastos (v0.4)

> Fuente de verdad. Lo que no esté acá, no se implementa: se pregunta (ver `preguntas-abiertas.md`).
> v0.2: decisiones PA-01, PA-02, PA-03. v0.3: decisiones PA-04, PA-05, PA-06. v0.4: decisiones PA-07, PA-08, PA-09.

## Contexto
Mucha gente llega a fin de mes sin saber en qué se le fue la plata. Los gastos chicos se anotan en papel o en una planilla que nadie mantiene, y las compras en cuotas hacen que lo que se gasta hoy se pague durante meses sin que nadie lo tenga presente. Se necesita una app web simple para registrar gastos e ingresos en segundos, ver el resumen del mes, controlar las cuotas y recibir un aviso antes de pasarse del presupuesto.

La primera versión (Módulo 2) fue solo frontend con `localStorage`. Esta versión agrega backend propio y base de datos.

## Reglas de negocio

### Movimientos
- **RN-01 Movimiento.** Cada movimiento tiene: tipo (`gasto` o `ingreso`), descripción (obligatoria, 1 a 60 caracteres sin contar espacios al inicio y al final), monto, categoría, fecha, medio de pago (`Efectivo`, `Débito`, `Crédito`, `Transferencia`) y una nota opcional (hasta 200 caracteres).
- **RN-02 Fecha y zona horaria** (PA-02): todo el sistema opera en `America/Argentina/Buenos_Aires`. La fecha de un movimiento es una fecha de calendario (`AAAA-MM-DD`) y **no puede ser posterior a hoy** en hora argentina. La única excepción son las cuotas futuras (RN-06).
- **RN-03 Categorías por tipo** (PA-03): la categoría tiene que corresponder al tipo.
  - Gastos: Comida, Transporte, Servicios, Alquiler, Salud, Ocio, Educación, Otros gastos.
  - Ingresos: Sueldo, Extras, Otros ingresos.
- **RN-04 Montos** (PA-01): se guardan como **centavos enteros** mayores a 0 (por ejemplo, $ 12.500,50 = 1250050). Nunca se usan números con decimales para guardar ni sumar dinero. El formato en pesos ($ 12.500,50) es solo para mostrar.

### Resumen
- **RN-05 Resumen mensual.** Para un mes (`AAAA-MM`): total de ingresos, total de gastos, saldo (ingresos − gastos, puede ser negativo) y gastos por categoría, ordenados de mayor a menor, con su porcentaje sobre el total de gastos redondeado al entero. Un mes sin gastos devuelve la lista de categorías vacía. Las cuotas cuentan en el mes de cada cuota, no en el de la compra.

### Cuotas
- **RN-06 Compras en cuotas** (PA-04, PA-05): un **gasto** pagado con **Crédito** se puede registrar en 2 a 24 cuotas.
  - Se crea un movimiento por cuota, todos vinculados al mismo grupo.
  - La cuota 1 lleva la fecha de la compra (que no puede ser futura); la cuota *n* lleva el mismo día del mes *n − 1* meses después. Si ese día no existe en el mes, se usa el último día (compra el 31/01 → cuota 2 el 28/02 o 29/02).
  - El monto total se divide en partes iguales en centavos; los centavos que sobran se suman a la **primera** cuota. Ejemplo: $ 1.000,00 en 3 cuotas → $ 333,34 + $ 333,33 + $ 333,33.
  - La descripción de cada cuota termina en `(cuota n/N)`. Ejemplo: `Heladera (cuota 3/12)`.
- **RN-07 Eliminar** (PA-06): eliminar un movimiento suelto lo borra. Eliminar **cualquier cuota** borra **todas** las cuotas de esa compra, para que no queden compras "a medias".

### Presupuestos
- **RN-08 Presupuesto por categoría** (PA-07, PA-08): se puede fijar un monto mensual para cada categoría de **gasto**. El mismo monto vale para todos los meses hasta que se cambie o se borre. El estado del presupuesto en un mes depende de cuánto se gastó en esa categoría:
  - **OK:** gastado < 80% del presupuesto.
  - **ALERTA:** gastado ≥ 80% y ≤ 100%. Llegar exactamente al 100% es ALERTA, no excedido.
  - **EXCEDIDO:** gastado > 100%.

### Acceso
- **RN-09 Usuario único y login** (PA-09): la app es de una sola persona. No hay registro: el email y la contraseña se definen en variables de entorno del servidor. Para usar cualquier parte de la API (salvo `/api/health` y `/api/login`) hay que iniciar sesión. Sin sesión válida, la API responde 401.

## Historias de usuario
- **HU-01** Como usuario quiero registrar un gasto o un ingreso en pocos segundos. (RN-01..RN-04)
- **HU-02** Como usuario quiero ver los movimientos de un mes, del más reciente al más antiguo, y moverme entre meses. (RN-02)
- **HU-03** Como usuario quiero ver el resumen del mes: ingresos, gastos, saldo y en qué categorías gasto más. (RN-05)
- **HU-04** Como usuario quiero registrar una compra en cuotas y ver cada cuota en su mes. (RN-06)
- **HU-05** Como usuario quiero eliminar un movimiento cargado por error. (RN-07)
- **HU-06** Como usuario quiero fijar un presupuesto por categoría y ver un aviso cuando me acerco o me paso. (RN-08)
- **HU-07** Como usuario quiero que mis datos solo los vea yo, iniciando sesión. (RN-09)
- **HU-08** Como usuario quiero editar un movimiento. (pendiente: PA-10)
