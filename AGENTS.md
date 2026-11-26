# AGENTS.md — Gobernanza del proyecto MisGastos

## Principios
1. **La especificación es la ley.** La fuente de verdad es `docs/spec.md`. Si una regla de negocio no está especificada, **no se inventa**: se frena y se registra la duda en `docs/preguntas-abiertas.md`.
2. **Todo cambio entra por la spec.** Orden obligatorio:
   1. Modificar `docs/spec.md` (y `docs/glossary.md` si hay términos nuevos).
   2. Actualizar `docs/plan-tecnico.md` / `docs/api.md` si cambia la arquitectura o el contrato.
   3. Crear o actualizar tareas en `docs/tareas.md`.
   4. Escribir tests que fallan (**Test Rojo**).
   5. Implementar lo mínimo para que pasen (**Test Verde**).
   6. Refactorizar sin romper tests.
3. **Trazabilidad.** Cada commit referencia una regla (`RN-xx`) o historia (`HU-xx`). Formato: `feat(cuotas): [RN-06] centavos sobrantes en la primera cuota`.
4. **Capas estrictas en el backend:** `routes -> controllers -> services -> repositories`. Los controllers no acceden a repositories; los repositories no contienen reglas de negocio. Las reglas puras viven en `domain/` y no importan Express ni la base de datos.
5. **Dinero y fechas:** montos siempre en centavos enteros; "hoy" siempre desde el `Reloj` (nunca `new Date()` en el dominio); fechas como texto `AAAA-MM-DD`.

## Roles
| Rol | Responsabilidad | Puede tocar |
|---|---|---|
| **Analista** | Mantiene la spec y el glosario; registra preguntas abiertas | `docs/spec.md`, `docs/glossary.md`, `docs/preguntas-abiertas.md` |
| **Arquitecto** | Plan técnico, modelo de datos, contrato de la API | `docs/plan-tecnico.md`, `docs/api.md`, `backend/migrations/` |
| **Tester** | Escribe los tests rojos a partir de la spec | `backend/tests/`, `frontend/src/**/*.test.ts` |
| **Dev Backend** | Pone los tests en verde respetando las capas | `backend/src/` |
| **Dev Frontend** | Interfaz React + TS | `frontend/` |
| **Revisor** | Revisa seguridad y robustez antes del merge (`.cursor/agents/revisor.md`, solo lectura) | Comentarios en el PR |

## Comandos
```bash
# backend
cd backend && npm install && npm test && npm run dev     # API en http://localhost:3000
npm run typecheck && npm run build

# frontend
cd frontend && npm install && npm test && npm run dev    # http://localhost:5173
```

## Qué NO hacer sin permiso
- Instalar dependencias nuevas.
- Cambiar reglas de negocio sin que la spec cambie primero.
- Modificar migraciones ya aplicadas: se agrega una migración nueva.
- Subir `.env`, `node_modules/`, `dist/` o `.data/` al repositorio.
- Borrar o modificar tests para que "pasen".

## Definición de "hecho"
- Existe RN/HU en la spec que lo respalda.
- Tests escritos primero y en verde.
- CI en verde (typecheck, test, build).
- PR revisado por el Revisor y aprobado.
- Merge a `main` ⇒ despliegue automático (Render backend, Netlify frontend).
