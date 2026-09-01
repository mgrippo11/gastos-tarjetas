import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Usuarios con permiso de login, más allá del ADMIN_EMAIL hardcodeado (que
// siempre entra y es el único que puede administrar esta tabla).
export const users = sqliteTable("users", {
  email: text("email").primaryKey(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
  name: text("name").notNull(),
  closingDay: integer("closing_day"), // 1-31, nullable
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
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

export const expensesRelations = relations(expenses, ({ one }) => ({
  card: one(cards, { fields: [expenses.cardId], references: [cards.id] }),
  category: one(categories, { fields: [expenses.categoryId], references: [categories.id] }),
}));

export const income = sqliteTable("income", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
  description: text("description"),
  amount: real("amount").notNull(),
  month: text("month").notNull(), // "YYYY-MM"
});
