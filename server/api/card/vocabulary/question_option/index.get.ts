import { drizzle } from 'drizzle-orm/neon-http';
import { sql, ne, eq, and } from 'drizzle-orm';
import { union } from 'drizzle-orm/pg-core'
import { vocabulariesTable, setsTable, usersTable } from '~/server/db/schema';
import { shuffle } from '~/server/utils';
import { SetType } from '~/types/type'

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) => {
    const word = decodeURI((getQuery(event).word) as string)
    const meaning = decodeURI((getQuery(event).meaning) as string)
    const id = (getQuery(event).id) as number
    const user_id = (getQuery(event).user_id) as number
    const correctOption = db.select({
                                word: vocabulariesTable.word, 
                                meaning: vocabulariesTable.meaning,
                                pronunciation: vocabulariesTable.pronunciation,
                                isCorrect: sql`true`
                            })
                            .from(vocabulariesTable)
                            .where(eq(vocabulariesTable.id, id))
                            .limit(1)
    const wrongOption = db.select({
                                word: vocabulariesTable.word, 
                                meaning: vocabulariesTable.meaning,
                                pronunciation: vocabulariesTable.pronunciation,
                                isCorrect: sql`false`
                            })
                            .from(vocabulariesTable)
                            .leftJoin(setsTable, eq(vocabulariesTable.set_id, setsTable.id))
                            .leftJoin(usersTable, eq(setsTable.user_id, usersTable.id))
                            .where(and(
                                ne(vocabulariesTable.word, word), 
                                ne(vocabulariesTable.meaning, meaning),
                                eq(setsTable.type, SetType.vocabulary),
                                eq(usersTable.id, user_id)
                            ))
                            .orderBy(sql`random()`)
                            .limit(5)
    let result = await union(correctOption, wrongOption)
    shuffle(result)
    return result
})