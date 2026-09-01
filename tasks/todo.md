# Tasks: Gastos Tarjetas

## Fase 1: Foundation

### Task 1: Scaffold del proyecto
**Descripción:** Next.js 14 (App Router) + TypeScript + Tailwind + ESLint + Vitest, deploy inicial vacío a Vercel.

**Acceptance criteria:**
- [x] `npm run dev` levanta una página en blanco sin errores
- [x] El proyecto está en el repo git dentro de `gastos-tarjetas/`
- [x] Deployado en Vercel, la URL pública carga (https://gastos-tarjetas-six.vercel.app/)

**Verification:**
- [x] Build: `npm run build` sin errores
- [x] Manual: abrir la URL de Vercel

**Dependencies:** None
**Files:** `package.json`, `app/layout.tsx`, `app/page.tsx`, `tailwind.config.ts`
**Scope:** M

---

### Task 2: Schema de base de datos + conexión Turso
**Descripción:** Definir schema Drizzle (`cards`, `categories`, `expenses`, `income`) y aplicarlo a Turso.

**Acceptance criteria:**
- [x] `npm run db:push` aplica el schema a Turso sin error
- [x] `npm run db:studio` muestra las 4 tablas vacías

**Verification:**
- [x] Manual: `db:studio` conecta y muestra tablas
- [x] Tests: ninguno (schema declarativo, se valida con push real)

**Dependencies:** Task 1
**Files:** `db/schema.ts`, `db/client.ts`, `drizzle.config.ts`
**Scope:** S

---

### Task 3: Autenticación
**Descripción:** NextAuth Google provider. Callback `signIn` deja pasar a `ADMIN_EMAIL` o a cualquier email en la tabla `users`. Proxy (`middleware.ts` renombrado en Next 16) protege todas las rutas salvo `/login`.

**Acceptance criteria:**
- [x] Entrar a cualquier ruta sin sesión redirige a `/login`
- [x] Login con la cuenta Google de `ADMIN_EMAIL` entra
- [ ] Login con una cuenta Google no listada es rechazado, no entra

**Verification:**
- [x] Manual: probar los casos de arriba en local y en Vercel (con env vars configuradas ahí también)

**Dependencies:** Task 1
**Files:** `app/(auth)/login/page.tsx`, `proxy.ts`, `auth.ts`
**Scope:** M

---

### Task 3b: Panel admin — gestión de usuarios invitados
**Descripción:** `/admin/users`, solo accesible por `ADMIN_EMAIL`: listar/agregar/quitar emails de la tabla `users` (allowlist de login).

**Acceptance criteria:**
- [ ] `ADMIN_EMAIL` puede agregar un email y ese email pasa a poder loguearse
- [ ] `ADMIN_EMAIL` puede quitar un email y ese email deja de poder loguearse
- [ ] Un usuario no-admin logueado que entra a `/admin/users` es redirigido, no ve la página

**Verification:**
- [ ] Manual: agregar un email de prueba, verificar que loguea; quitarlo, verificar que ya no puede

**Dependencies:** Task 3
**Files:** `db/schema.ts` (tabla `users`), `app/admin/users/page.tsx`, `app/admin/users/actions.ts`, `auth.ts`
**Scope:** S

---

## Checkpoint: Foundation
- [x] App deployada en Vercel con login funcionando
- [x] Nadie sin contraseña puede ver una ruta protegida
- [ ] Revisar con Martín antes de seguir

---

## Fase 2: Cards & Categories

### Task 4: Tarjetas (CRUD simple)
**Descripción:** Página para listar y agregar tarjetas (nombre + día de cierre opcional). Sin edición/borrado en v1 salvo que sea trivial agregarlo.

**Acceptance criteria:**
- [ ] Se pueden agregar las 4 tarjetas reales de Martín (Visa ICBC, Master ICBC, Visa Galicia, BBVA)
- [ ] La lista de tarjetas se ve en `/cards`

**Verification:**
- [ ] Manual: agregar y listar

**Dependencies:** Task 2, Task 3
**Files:** `app/cards/page.tsx`, `app/cards/actions.ts`
**Scope:** S

---

### Task 5: Categorías (CRUD simple + semillas)
**Descripción:** Seed script con las 7 categorías default, página para agregar categorías nuevas.

**Acceptance criteria:**
- [ ] Al correr el seed, existen las 7 categorías default
- [ ] Se puede agregar una categoría nueva desde la UI

**Verification:**
- [ ] Manual: correr seed, ver categorías en `/categories`

**Dependencies:** Task 2, Task 3
**Files:** `db/seed.ts`, `app/categories/page.tsx`, `app/categories/actions.ts`
**Scope:** S

---

## Checkpoint: Cards & Categories
- [ ] Datos base cargados, listos para usarse como FK en gastos

---

## Fase 3: Expenses (cuotas automáticas)

### Task 6: `lib/installments.ts` + tests
**Descripción:** Función pura que, dado `purchase_month` y `total_installments`, devuelve la lista de meses donde cae cada cuota. Sin UI ni DB todavía.

**Acceptance criteria:**
- [x] Caso 1 cuota → devuelve solo el mes de compra
- [x] Caso 12 cuotas cruzando fin de año → meses correctos (dic 2025 → nov 2026)
- [x] Caso 3 cuotas dentro del mismo año

**Verification:**
- [x] Tests: `npm test` — todos los casos borde pasan (5/5)

**Dependencies:** None (independiente, se puede hacer en paralelo con Fase 2)
**Files:** `lib/installments.ts`, `tests/installments.test.ts`
**Scope:** XS

---

### Task 7: Alta de gasto
**Descripción:** Formulario para cargar un gasto: descripción, monto, categoría, tarjeta (o "vario" con día de vencimiento), cuotas totales, mes de compra.

**Acceptance criteria:**
- [ ] Cargar un gasto de tarjeta en 1 cuota funciona
- [ ] Cargar un gasto de tarjeta en 3 cuotas funciona (una sola carga)
- [ ] Cargar un gasto vario con día de vencimiento funciona

**Verification:**
- [ ] Manual: los 3 casos de arriba, revisar en `db:studio` que se guardó 1 sola fila

**Dependencies:** Task 4, Task 5, Task 6
**Files:** `app/expenses/new/page.tsx`, `app/expenses/actions.ts`
**Scope:** M

---

### Task 8: Listado de gastos por mes
**Descripción:** Ver los gastos de un mes dado, calculando qué cuotas caen ese mes vía `lib/installments.ts`. Editar/borrar un gasto.

**Acceptance criteria:**
- [ ] Un gasto de 3 cuotas cargado en enero aparece en enero, febrero y marzo con la cuota correcta (1/3, 2/3, 3/3)
- [ ] Editar o borrar el gasto se refleja en todos los meses donde aparecía

**Verification:**
- [ ] Manual: reproducir el criterio de éxito de la spec (cargar 1 vez, ver en 3 meses)
- [ ] Tests: reutiliza los de Task 6

**Dependencies:** Task 7
**Files:** `app/expenses/page.tsx`
**Scope:** M

---

## Checkpoint: Expenses
- [ ] Criterio de éxito central de la spec cumplido: cuotas automáticas funcionando end-to-end
- [ ] Revisar con Martín antes de seguir

---

## Fase 4: Income & Dashboard

### Task 9: Ingresos (CRUD simple)
**Descripción:** Alta y listado de ingresos por mes (descripción opcional + monto).

**Acceptance criteria:**
- [ ] Cargar un ingreso y verlo listado en `/income` filtrado por mes

**Verification:**
- [ ] Manual

**Dependencies:** Task 2, Task 3
**Files:** `app/income/page.tsx`, `app/income/actions.ts`
**Scope:** S

---

### Task 10: Dashboard mensual
**Descripción:** Vista de un mes: total por tarjeta, total por categoría, ingresos vs. gastos.

**Acceptance criteria:**
- [ ] Elegir un mes muestra el total correcto por cada tarjeta activa ese mes
- [ ] Muestra total por categoría
- [ ] Muestra ingresos vs. gastos del mes

**Verification:**
- [ ] Manual: comparar contra un mes ya cargado del Excel viejo para validar que los totales cierran

**Dependencies:** Task 8, Task 9
**Files:** `app/dashboard/page.tsx`
**Scope:** M

---

## Checkpoint: Income & Dashboard
- [ ] Flujo completo de un mes (gastos + ingresos + balance) funciona de punta a punta

---

## Fase 5: Import PDF

### Task 11: `lib/pdf-parser.ts` + tests
**Descripción:** Extraer texto de un PDF (`pdf-parse`) y parsear líneas candidatas a gasto (fecha + descripción + monto) por regex genérico.

**Acceptance criteria:**
- [x] Con el texto de al menos 1 resumen real de Martín, extrae la mayoría de las líneas de gasto reconocibles (probado con ICBC 6/6 y Galicia 23/23 reales)
- [x] Líneas que no matchean el patrón se descartan sin romper el parseo del resto

**Verification:**
- [x] Tests: `npm test` — 20/20, fixtures anonimizados que replican los layouts reales

**Dependencies:** None (independiente, se puede empezar en paralelo)
**Files:** `lib/pdf-parser.ts`, `tests/pdf-parser.test.ts`, `tests/fixtures/resumen-ejemplo.txt`
**Scope:** M

---

### Task 12: UI de importación — upload y preview
**Descripción:** Subir PDF, elegir tarjeta, correr el parser, mostrar tabla editable de gastos candidatos (borrar fila, editar monto/descripción, asignar categoría).

**Acceptance criteria:**
- [x] Subir un PDF real muestra una tabla con los gastos detectados
- [x] Se puede editar o borrar cualquier fila antes de confirmar (checkbox "incluir" excluye la fila del import)

**Verification:**
- [x] Manual: subido ICBC y Galicia reales, preview + total correctos

**Dependencies:** Task 4, Task 5, Task 11
**Files:** `app/import/page.tsx`, `app/import/actions.ts`
**Scope:** M

---

### Task 13: Confirmar importación
**Descripción:** Al confirmar la preview, insertar todos los gastos como filas en `expenses` (1 cuota cada uno, salvo que el usuario marque cuotas al editar la fila).

**Acceptance criteria:**
- [ ] Confirmar la preview inserta todos los gastos visibles en la tabla
- [ ] Los gastos importados aparecen en `/expenses` y en el dashboard del mes correspondiente

**Verification:**
- [ ] Manual: importar un resumen completo y verificar contra el dashboard

**Dependencies:** Task 12
**Files:** `app/import/actions.ts`
**Scope:** S

---

## Checkpoint: Import PDF
- [ ] Un resumen real de Martín se importa de punta a punta más rápido que cargarlo a mano
- [ ] Revisar con Martín — este es el checkpoint de mayor riesgo del proyecto

---

## Fase 6: Polish

### Task 14: Validación de inputs
**Descripción:** Validar montos (número positivo), meses (formato válido), días de cierre/vencimiento (1-31) en todos los formularios.

**Acceptance criteria:**
- [ ] Ningún formulario permite guardar un monto negativo o no numérico
- [ ] Mensajes de error claros en cada formulario

**Verification:**
- [ ] Manual: probar inputs inválidos en cada formulario

**Dependencies:** Tasks 7, 9, 12
**Files:** varios `actions.ts`
**Scope:** S

---

### Task 15: Verificación final de deploy
**Descripción:** Confirmar que todas las env vars están seteadas en Vercel, smoke test completo en producción.

**Acceptance criteria:**
- [ ] Los 4 criterios de éxito de SPEC.md se cumplen en la URL pública de Vercel, no solo en local

**Verification:**
- [ ] Manual: recorrer los 4 criterios de éxito en producción

**Dependencies:** All previous tasks
**Files:** N/A (verificación, no código)
**Scope:** XS

---

## Checkpoint: Complete
- [ ] Todos los criterios de éxito de SPEC.md cumplidos en producción
- [ ] Listo para uso real de Martín
