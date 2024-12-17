import { integer, pgTable, varchar, real, timestamp, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
})

export const cardSetsTable = pgTable("card_lists", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer().references(() => usersTable.id),
    name: varchar({ length: 255 }).notNull()
})

export const cardsTable = pgTable("cards", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    word: varchar({ length: 255 }).notNull(),
    pronunciation: varchar({ length: 255 }),
    meaning: text().notNull(),
    example: text(),
    set_id: integer().references(() => cardSetsTable.id),

    repetitions: integer().default(0).notNull(),
    interval: integer().default(0).notNull(),
    ease_factor: real().default(1.3).notNull(),
    next_study_time: timestamp({mode: "date"}).defaultNow().notNull()
})