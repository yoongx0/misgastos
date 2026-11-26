# Tareas técnicas

- [x] T-00 Resolver preguntas abiertas críticas (PA-01 a PA-09)
- [x] T-01 [RN-02] Tiempo: hoy en Argentina, fechas y meses válidos, reloj inyectable (`domain/tiempo.ts`)
- [x] T-02 [RN-01, RN-03, RN-04] Validación de movimientos y categorías por tipo (`domain/movimiento.ts`, `domain/categorias.ts`, `domain/montos.ts`)
- [x] T-03 [RN-06] División en cuotas: resto en la 1.ª cuota, último día del mes (`domain/cuotas.ts`)
- [x] T-04 [RN-05] Resumen mensual (`domain/resumen.ts`, reutilizado del TP de refactoring)
- [x] T-05 [RN-08] Estado del presupuesto OK / ALERTA / EXCEDIDO (`domain/presupuesto.ts`)
- [x] T-06 Esquema de base y migraciones (`migrations/001_inicial.sql`, ADR-001, ADR-002, ADR-006, ADR-007)
- [x] T-07 [HU-01, HU-02, HU-04, HU-05] API de movimientos por capas, eliminación de cuotas por grupo (RN-07)
- [x] T-08 [HU-03, HU-06] API de resumen y presupuestos
- [x] T-09 [HU-07, RN-09] Login con usuario único y JWT; 401 en rutas protegidas (ADR-004)
- [x] T-10 Frontend: login, navegación por mes, resumen, presupuestos, alta con cuotas, lista y eliminación
- [x] T-11 CI (typecheck, tests, build) y configuración de despliegue (`render.yaml`, `frontend/netlify.toml`)
- [ ] T-12 Desplegar: crear la base en Neon, el servicio en Render y el sitio en Netlify, y cargar las variables de entorno
- [ ] T-13 [HU-08] Editar movimientos (bloqueada por PA-10)
- [ ] T-14 Limitar intentos de login por IP (riesgo detectado por el Revisor: hoy se puede probar contraseñas sin límite)

## Verificación de esta versión (v0.4)
- Backend: 82 tests en verde (dominio + API contra PostgreSQL real con PGlite), typecheck y build OK.
- Frontend: 21 tests en verde (conversión de montos y fechas), build OK.
- Prueba de punta a punta en Chrome (frontend compilado + backend compilado, en orígenes distintos para verificar CORS): 12 de 12 comprobaciones. Ver `docs/capturas/`.
