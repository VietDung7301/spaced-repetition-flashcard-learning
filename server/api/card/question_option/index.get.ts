import { drizzle } from 'drizzle-orm/neon-http';
import { sql, ne, eq, and } from 'drizzle-orm';
import { union } from 'drizzle-orm/pg-core'
import { cardsTable } from '../../../db/schema';
import { shuffle } from '~/server/utils';

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) => {
    const word = decodeURI((getQuery(event).word) as string)
    const meaning = decodeURI((getQuery(event).meaning) as string)
    const id = (getQuery(event).meaning) as number
    const correctOption = db.select({
                                word: cardsTable.word, 
                                meaning: cardsTable.meaning,
                                pronunciation: cardsTable.pronunciation,
                                isCorrect: sql`true`
                            })
                            .from(cardsTable)
                            .where(eq(cardsTable.id, id))
                            .limit(1)
    const wrongOption = db.select({
                                word: cardsTable.word, 
                                meaning: cardsTable.meaning,
                                pronunciation: cardsTable.pronunciation,
                                isCorrect: sql`false`
                            })
                            .from(cardsTable)
                            .where(and(ne(cardsTable.word, word), ne(cardsTable.meaning, meaning)))
                            .orderBy(sql`random()`)
                            .limit(5)
    let result = await union(correctOption, wrongOption)
    shuffle(result)
    return result
})