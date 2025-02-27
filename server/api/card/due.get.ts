import { drizzle } from 'drizzle-orm/neon-http';
import { eq, lte, sql, and, count } from 'drizzle-orm';
import { vocabulariesTable, setsTable, grammarsTable, kanjisTable } from '~/server/db/schema';
import { SetType } from "~/types/type"

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) => {
    const user_id = (getQuery(event).user_id) as number
    const dueVocab = await db.select({count: count()})
                            .from(vocabulariesTable)
                            .innerJoin(setsTable, eq(setsTable.id, vocabulariesTable.set_id))
                            .where(
                                and(
                                    eq(setsTable.user_id, user_id),
                                    lte(vocabulariesTable.next_study_time, sql`now()`),
                                    eq(setsTable.type, SetType.vocabulary)
                                ))
    
    const dueKanji = await db.select({count: count()})
                            .from(kanjisTable)
                            .innerJoin(setsTable, eq(setsTable.id, kanjisTable.set_id))
                            .where(
                                and(
                                    eq(setsTable.user_id, user_id),
                                    lte(kanjisTable.next_study_time, sql`now()`),
                                    eq(setsTable.type, SetType.kanji)
                                ))

    const dueGrammar = await db.select({count: count()})
                            .from(grammarsTable)
                            .innerJoin(setsTable, eq(setsTable.id, grammarsTable.set_id))
                            .where(
                                and(
                                    eq(setsTable.user_id, user_id),
                                    lte(grammarsTable.next_study_time, sql`now()`),
                                    eq(setsTable.type, SetType.grammar)
                                ))
    const result = {
        vocab: dueVocab[0].count,
        kanji: dueKanji[0].count,
        grammar: dueGrammar[0].count
    }
    return result
})