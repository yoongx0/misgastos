# Plan técnico (Arquitecto) — v0.3

## Arquitectura
```
frontend (React + Vite, Netlify)  ──HTTP + JSON──►  backend (Express + TS, Render)  ──SQL──►  PostgreSQL (Neon)
```

Capas del backend: `routes -> controllers (HTTP) -> services (casos de uso) -> repositories (SQL)`. Las reglas puras (validación, cuotas, resumen, presupuestos, fechas) viven en `domain/` y se testean sin base de datos.

## Entidades
- **movimientos**: id (uuid), tipo, descripcion, monto_centavos (bigint), categoria, fecha (date), medio_de_pago, nota, grupo_id (uuid, nulo si no es cuota), cuota_numero, cuota_total, creado_en.
- **presupuestos**: categoria (PK), monto_mensual_centavos (bigint).

## Decisiones (ADR)
- **ADR-001 Base de datos: PostgreSQL.** Los datos son relacionales (cuotas vinculadas por grupo) y se consultan por rango de fechas. En producción, Neon (Postgres administrado), como en la clase 10.
- **ADR-002 Acceso a datos: `pg` con SQL propio y migraciones versionadas** (`backend/migrations/`), sin ORM. Es poco SQL, y así queda a la vista. Todas las consultas usan parámetros (`$1`, `$2`…), nunca texto concatenado.
- **ADR-003 Desarrollo y tests con PGlite.** PGlite es PostgreSQL real compilado para correr dentro de Node. Si `DATABASE_URL` está vacía, el backend usa PGlite (en memoria en los tests, en `./.data` en desarrollo). Así los tests prueban **el mismo SQL y las mismas migraciones** que producción, sin instalar Postgres ni Docker.
- **ADR-004 Autenticación: JWT** en `Authorization: Bearer`, porque frontend y backend están en dominios distintos (Netlify y Render). Un solo usuario, con credenciales en variables de entorno (PA-09). La contraseña se compara en tiempo constante. Token de 7 días (PA-14, provisorio).
- **ADR-005 Reloj inyectable.** Ninguna regla lee `new Date()` directamente: el "hoy" lo da un `Reloj` que en los tests se fija a una fecha (clase 8). Así se prueba "fecha futura" o "cuota del 31/01" sin depender del día en que se corre el test.
- **ADR-006 Fechas como texto `AAAA-MM-DD` en el contrato de la API.** La columna es `date`, pero se lee con `to_char(...)`. Un `date` leído como `Date` de JavaScript se corre de día por la zona horaria (clase 9: JSON no tiene tipo fecha).
- **ADR-007 Montos en centavos (`bigint`).** `integer` llega solo hasta $ 21 millones, poco para una compra grande. Los decimales (`real`) se descartaron por errores de redondeo (ver PA-01).

## Riesgos conocidos
- El plan gratuito de Render "duerme" el backend: el primer pedido después de un rato tarda unos 30 s. El frontend muestra "Cargando…" mientras tanto.
- Usuario único: si en el futuro hay varios usuarios, hay que agregar `usuario_id` a las tablas (nueva PA antes de hacerlo).
