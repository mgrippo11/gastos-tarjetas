import { config } from "dotenv";
config({ path: ".env.local" });

const DEFAULT_CATEGORIES = [
  "Comida",
  "Servicios",
  "Entretenimiento",
  "Transporte",
  "Salud",
  "Suscripciones",
  "Otros",
];

async function seed() {
  // dynamic import: db/client.ts reads process.env.TURSO_* at import time,
  // so it must load after dotenv has populated it (static imports hoist).
  const { db } = await import("./client");
  const { categories } = await import("./schema");

  const existing = await db.query.categories.findMany();
  const existingNames = new Set(existing.map((c) => c.name));
  const toInsert = DEFAULT_CATEGORIES.filter((name) => !existingNames.has(name));

  if (toInsert.length === 0) {
    console.log("Categorías default ya existen, nada que hacer.");
    return;
  }

  await db.insert(categories).values(toInsert.map((name) => ({ name })));
  console.log(`Insertadas: ${toInsert.join(", ")}`);
}

// ponytail: @libsql/client's native async handle can crash Node on forced
// process.exit(); let the event loop drain naturally instead.
seed();
