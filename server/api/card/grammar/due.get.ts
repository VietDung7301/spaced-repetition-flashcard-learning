import { drizzle } from 'drizzle-orm/neon-http';
import { eq, lte, sql, and } from 'drizzle-orm';
import { grammarsTable, setsTable } from '~/server/db/schema';
import { SetType } from "~/types/type"

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) => {
    const user_id = (getQuery(event).user_id) as number
    const result = await db.select()
                            .from(grammarsTable)
                            .innerJoin(setsTable, eq(setsTable.id, grammarsTable.set_id))
                            .where(
                                and(
                                    eq(setsTable.user_id, user_id),
                                    lte(grammarsTable.next_study_time, sql`now()`),
                                    eq(setsTable.type, SetType.grammar)
                                ))
                            .orderBy(sql`random()`)
    const dueCardList = result.map((card) => card.grammars)
    return dueCardList
})