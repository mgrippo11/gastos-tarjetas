# Spec: Gastos Tarjetas

## Objetivo

Reemplazar la planilla Excel personal de Martín para el control de gastos de tarjetas de crédito, ingresos y gastos varios. Un solo usuario (Martín), acceso web con login.

Problema hoy: cada mes retipea a mano cada gasto en cuotas ("spotify 01|03", "spotify 02|03"...), no tiene categorías, y cargar un resumen de tarjeta es 100% manual.

**Éxito** = poder cargar un gasto en cuotas una sola vez y verlo reflejado solo en los meses que corresponde; poder subir el PDF de un resumen y cargar varios gastos de una sola vez en vez de uno por uno; ver totales por mes, por tarjeta y por categoría sin armar fórmulas.

## Alcance (v1)

Incluye: tarjetas, gastos de tarjeta (con cuotas automáticas), gastos varios (efectivo/débito), ingresos, categorías, balance mensual, importación de resúmenes en PDF.

Fuera de v1 (no pedido, no se construye): multi-usuario, multi-moneda (todo es ARS), apps móviles nativas, conciliación bancaria automática, notificaciones/recordatorios.

## Tech Stack

- **Next.js 14+ (App Router) + TypeScript** — un solo proyecto full-stack, sin backend aparte.
- **Turso (libSQL)** — ya tenés la cuenta.
- **Drizzle ORM** — capa fina sobre libSQL, tipado, sin magia.
- **NextAuth (Credentials provider)** — login simple usuario/contraseña vía variables de entorno, sin tabla de usuarios ni flujo de registro (sos el único usuario).
- **Tailwind CSS** — estilos sin escribir CSS a mano.
- **Vercel** — ya tenés la cuenta; deploy con `git push`.
- **pdf-parse** — extracción de texto de PDFs de resúmenes (ver sección Importación).

## Modelo de datos

```
cards
  id, name, closing_day (nullable int 1-31)   -- día de cierre del resumen

categories
  id, name                                     -- semillas: Comida, Servicios, Entretenimiento,
                                                -- Transporte, Salud, Suscripciones, Otros

expenses
  id, card_id (nullable -> null = gasto vario / efectivo)
  category_id (nullable)
  description
  amount              -- monto de CADA cuota, en ARS
  total_installments  -- 1 si es pago único
  purchase_month      -- "YYYY-MM", mes de la 1ra cuota
  due_day             -- nullable int 1-31, solo aplica a gastos varios (card_id null)
  created_at

income
  id, description (nullable), amount, month ("YYYY-MM")
```

**Cuotas automáticas**: no se duplica una fila por mes. Un gasto con `total_installments=3` y `purchase_month="2026-01"` aparece calculado en Enero, Febrero y Marzo (cuota 1/3, 2/3, 3/3) con una sola carga. Esto es la mejora real sobre el Excel actual.

## Importación de resúmenes (PDF)

Flujo: subís el PDF de un resumen → elegís a qué tarjeta corresponde → el sistema extrae texto con `pdf-parse` y busca líneas con patrón `fecha + descripción + monto` → te muestra una **tabla editable de previsualización** (podés corregir/borrar/asignar categoría antes de confirmar) → al confirmar, inserta los gastos.

**Límite conocido**: cada banco tiene su propio formato de PDF; el parser inicial cubre patrones genéricos (columnas fecha/descripción/monto en texto). Bancos con layouts raros pueden requerir ajustar filas a mano en la previsualización — por eso la previsualización es editable, no una carga ciega. `ponytail: parser genérico por regex, agregar parser específico por banco si el genérico falla seguido`.

## Comandos

```
Dev:      npm run dev
Build:    npm run build
Start:    npm run start
Test:     npm test
Lint:     npm run lint
DB push:  npm run db:push       (drizzle-kit push, aplica el schema a Turso)
DB studio: npm run db:studio    (drizzle-kit studio, inspección visual)
```

## Estructura del proyecto

```
app/                    → rutas Next.js (App Router)
  (auth)/login/         → página de login
  dashboard/             → resumen mensual (totales por tarjeta/categoría)
  expenses/              → listado + alta de gastos
  income/                → carga de ingresos
  import/                → subida y preview de resúmenes PDF
  api/                   → route handlers (server actions donde alcance)
db/
  schema.ts              → definición Drizzle
  client.ts              → conexión a Turso
lib/
  installments.ts        → cálculo de en qué meses cae cada cuota
  pdf-parser.ts           → extracción de líneas gasto desde PDF
components/              → UI compartida
tests/                   → Vitest
```

## Estilo de código

TypeScript estricto, funciones chicas, sin capas que no se usan (sin repositorios genéricos, sin DTOs si el tipo de Drizzle ya alcanza). Ejemplo del estilo esperado:

```ts
// lib/installments.ts
export function monthsForExpense(purchaseMonth: string, totalInstallments: number): string[] {
  const [year, month] = purchaseMonth.split("-").map(Number);
  return Array.from({ length: totalInstallments }, (_, i) => {
    const d = new Date(year, month - 1 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}
```

## Estrategia de testing

**Vitest** para la lógica con riesgo real de bug silencioso:
- `lib/installments.ts` — cálculo de meses de cuotas (casos borde: diciembre→enero, 1 sola cuota, 12 cuotas).
- `lib/pdf-parser.ts` — parseo de líneas de texto a gasto candidato.

Sin e2e ni tests de UI en v1 — proyecto de un solo usuario, se valida a mano en el navegador. Se agrega Playwright si el proyecto crece.

## Boundaries

- **Siempre**: correr `npm test` y `npm run lint` antes de dar por terminada una tarea. Validar inputs de montos/fechas antes de guardar en DB.
- **Preguntar antes**: cambiar el schema de la base ya en producción (Turso) de forma destructiva, agregar una dependencia nueva no listada acá, cambiar el mecanismo de login.
- **Nunca**: commitear `.env`/credenciales, exponer el dashboard sin login.

## Criterios de éxito

- Cargar un gasto en 3 cuotas una vez y verlo aparecer en el dashboard de los 3 meses correspondientes, sin recargarlo.
- Subir un PDF de resumen y terminar con N gastos cargados en menos clicks que cargarlos uno por uno a mano.
- Ver, para un mes dado: total por tarjeta, total por categoría, ingresos vs. gastos.
- Login funcionando en la URL de Vercel; nadie sin contraseña puede ver los datos.

## Decisiones cerradas

- Categorías semilla: Comida, Servicios, Entretenimiento, Transporte, Salud, Suscripciones, Otros (editable después, no está grabado en piedra).
- Gastos varios sí tienen `due_day` (día de vencimiento), igual que en el Excel.
