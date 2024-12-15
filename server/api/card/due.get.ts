import { drizzle } from 'drizzle-orm/neon-http';
import { eq, lte, sql, and } from 'drizzle-orm';
import { cardsTable, cardSetsTable } from '../../db/schema';

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) => {
    const user_id = (getQuery(event).user_id) as number
    const result = await db.select()
                            .from(cardsTable)
                            .innerJoin(cardSetsTable, eq(cardSetsTable.id, cardsTable.set_id))
                            .where(
                                and(
                                    eq(cardSetsTable.user_id, user_id),
                                    lte(cardsTable.next_study_time, sql`now()`)
                                ))
    const dueCardList = result.map((card) => card.cards)
    return dueCardList
})