import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
})

export const listsTable = pgTable("card_lists", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer().references(() => usersTable.id),
    name: varchar({ length: 255 }).notNull()
})

export const cardsTable = pgTable("cards", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    word: varchar({ length: 255 }).notNull(),
    pronunciation: varchar({ length: 255 }),
    meaning: varchar({ length: 255 }).notNull(),
    example: varchar({ length: 255 }),
    list_id: integer().references(() => listsTable.id)
})