import { integer, pgTable, varchar, real, timestamp, text, unique } from "drizzle-orm/pg-core";
import { SetType } from "../../types/type";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
})

export const setsTable = pgTable("card_lists", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer().references(() => usersTable.id),
    name: varchar({ length: 255 }).notNull(),
    type: integer().notNull().default(SetType.vocabulary)
})

export const vocabulariesTable = pgTable("cards", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    word: varchar({ length: 255 }).notNull(),
    pronunciation: varchar({ length: 255 }),
    meaning: text().notNull(),
    example: text(),
    set_id: integer().references(() => setsTable.id),

    repetitions: integer().default(0).notNull(),
    interval: integer().default(0).notNull(),
    ease_factor: real().default(1.3).notNull(),
    next_study_time: timestamp({mode: "date"}).defaultNow().notNull()
}, (t) => [
    unique("card_word_constraint").on(t.word, t.set_id)
])

export const kanjisTable = pgTable("kanjis", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    word: varchar({ length: 255 }).notNull(),       // Kanji
    pronunciation: varchar({ length: 255 }),        // Hiragana
    meaning: text().notNull(),                      // Meaning  
    how_to_remember: text(),                        // How to remember
    example: text(),                                // Example
    set_id: integer().references(() => setsTable.id),

    repetitions: integer().default(0).notNull(),
    interval: integer().default(0).notNull(),
    ease_factor: real().default(1.3).notNull(),
    next_study_time: timestamp({mode: "date"}).defaultNow().notNull()
}, (t) => [
    unique("kanji_constraint").on(t.word, t.set_id)
])

export const grammarsTable = pgTable("grammars", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    grammar: varchar({ length: 255 }).notNull(),
    structure: text(),
    meaning: text().notNull(),
    example: text(),
    set_id: integer().references(() => setsTable.id),

    repetitions: integer().default(0).notNull(),
    interval: integer().default(0).notNull(),
    ease_factor: real().default(1.3).notNull(),
    next_study_time: timestamp({mode: "date"}).defaultNow().notNull()
}, (t) => [
    unique("grammar_constraint").on(t.grammar, t.set_id)
])