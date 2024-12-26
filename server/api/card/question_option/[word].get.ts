import { drizzle } from 'drizzle-orm/neon-http';
import { sql, ne, eq } from 'drizzle-orm';
import { union } from 'drizzle-orm/pg-core'
import { cardsTable } from '../../../db/schema';
import { shuffle } from '~/server/utils';

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) => {
    const word = decodeURI(getRouterParam(event, 'word') as string)
    console.log("word", word)
    const correctOption = db.select({
                                word: cardsTable.word, 
                                meaning: cardsTable.meaning,
                                pronunciation: cardsTable.pronunciation,
                                isCorrect: sql`true`
                            })
                            .from(cardsTable)
                            .where(eq(cardsTable.word, word))
    const wrongOption = db.select({
                                word: cardsTable.word, 
                                meaning: cardsTable.meaning,
                                pronunciation: cardsTable.pronunciation,
                                isCorrect: sql`false`
                            })
                            .from(cardsTable)
                            .where(ne(cardsTable.word, word))
                            .orderBy(sql`random()`)
                            .limit(5)
    let result = await union(correctOption, wrongOption)
    shuffle(result)
    return result
})