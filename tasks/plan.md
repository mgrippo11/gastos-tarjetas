# Implementation Plan: Gastos Tarjetas

## Overview

App de un solo usuario para reemplazar el Excel de gastos de tarjetas. Next.js + Turso, deploy en Vercel. Se construye en slices verticales: cada fase deja algo usable en el navegador, no capas sueltas sin conectar.

## Architecture Decisions

- **Server Actions en vez de API routes propias** donde alcance — menos boilerplate que armar `app/api/*` a mano para CRUDs simples (Next.js App Router ya lo resuelve).
- **Cuotas no se duplican en DB.** `lib/installments.ts` calcula en qué meses cae cada cuota a partir de `purchase_month` + `total_installments`. La lista mensual de gastos es una *query calculada*, no una tabla de ocurrencias.
- **PDF parsing y cálculo de cuotas se escriben y testean como funciones puras primero**, antes de tocar UI — son las dos partes con lógica real (todo lo demás es CRUD), y son los dos riesgos reales del proyecto.
- **Auth por invitación**: NextAuth Google provider. `ADMIN_EMAIL` (env var) siempre entra y es el único que administra la tabla `users` (allowlist) desde `/admin/users`. Datos de `cards`/`expenses`/`income` llevan `owner_email` y toda query filtra por el usuario en sesión — sin tabla de roles, sin permisos intermedios.

## Dependency Graph

```
Scaffold (Next.js+TS+Tailwind, deploy vacío a Vercel)
    │
    ├── Schema Drizzle + Turso ──┬── Auth (Credentials + middleware)
    │                            │
    │                            ├── Cards + Categories (CRUD simple, semillas)
    │                            │       │
    │                            │       └── Expenses
    │                            │             ├── lib/installments.ts (puro, testeado antes)
    │                            │             ├── alta gasto (tarjeta o vario)
    │                            │             └── listado por mes (cuota calculada)
    │                            │                   │
    │                            │                   ├── Income (CRUD simple)
    │                            │                   │
    │                            │                   └── Dashboard (totales por tarjeta/categoría/mes)
    │                            │
    │                            └── Import PDF
    │                                  ├── lib/pdf-parser.ts (puro, testeado antes)
    │                                  └── UI: upload → preview editable → confirmar → insert
    │
    └── Polish: validación de inputs, smoke test de deploy final
```

## Task List

Ver `tasks/todo.md` para el checklist ejecutable. Fases:

1. **Foundation** — scaffold, schema, auth
2. **Cards & Categories** — datos base que Expenses necesita como FK
3. **Expenses** — el valor central: cuotas automáticas
4. **Income & Dashboard** — balance mensual
5. **Import PDF** — la feature de mayor riesgo, lógica aislada y testeada antes de la UI
6. **Polish** — validación y verificación final de deploy

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cada banco tiene su propio formato de PDF; el parser genérico puede fallar | Medio | Preview editable antes de confirmar el import (nunca carga ciega); test con PDFs reales de Martín antes de dar la fase por cerrada |
| Cálculo de cuotas mal hecho corrompe totales silenciosamente | Alto | `lib/installments.ts` se testea con casos borde (diciembre→enero, 1 cuota, 12 cuotas) antes de conectarlo a UI |
| Turso/Vercel: variables de entorno mal configuradas en producción | Medio | Checkpoint de deploy real después de Foundation, no recién al final |

## Open Questions

- Ninguna pendiente — spec aprobada. Si aparece alguna durante la implementación, se resuelve en el momento y se anota en SPEC.md.
