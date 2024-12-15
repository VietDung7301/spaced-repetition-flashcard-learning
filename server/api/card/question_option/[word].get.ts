import { drizzle } from 'drizzle-orm/neon-http';
import { sql, ne } from 'drizzle-orm';
import { cardsTable } from '../../../db/schema';

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) => {
    const word = getRouterParam(event, 'word') as string
    const result = await db.select({
                                word: cardsTable.word, 
                                meaning: cardsTable.meaning,
                                pronunciation: cardsTable.pronunciation
                            })
                            .from(cardsTable)
                            .where(ne(cardsTable.word, word))
                            .orderBy(sql`random()`)
                            .limit(3)
    return result
})