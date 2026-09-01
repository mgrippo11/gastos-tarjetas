import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  closingDay: integer("closing_day"), // 1-31, nullable
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id").references(() => cards.id), // null = gasto vario
  categoryId: integer("category_id").references(() => categories.id),
  description: text("description").notNull(),
  amount: real("amount").notNull(), // monto de CADA cuota, en ARS
  totalInstallments: integer("total_installments").notNull().default(1),
  purchaseMonth: text("purchase_month").notNull(), // "YYYY-MM"
  dueDay: integer("due_day"), // 1-31, solo gastos varios
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const income = sqliteTable("income", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  description: text("description"),
  amount: real("amount").notNull(),
  month: text("month").notNull(), // "YYYY-MM"
});
