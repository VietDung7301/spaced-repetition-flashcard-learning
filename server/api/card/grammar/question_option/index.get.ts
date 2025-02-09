import { drizzle } from 'drizzle-orm/neon-http';
import { sql, ne, eq, and } from 'drizzle-orm';
import { union } from 'drizzle-orm/pg-core'
import { grammarsTable, setsTable, usersTable } from '~/server/db/schema';
import { shuffle } from '~/server/utils';
import { SetType } from '~/types/type'

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) => {
    const grammar = decodeURI((getQuery(event).grammar) as string)
    const meaning = decodeURI((getQuery(event).meaning) as string)
    const id = (getQuery(event).id) as number
    const user_id = (getQuery(event).user_id) as number
    const correctOption = db.select({
                                grammar: grammarsTable.grammar, 
                                meaning: grammarsTable.meaning,
                                isCorrect: sql`true`
                            })
                            .from(grammarsTable)
                            .where(eq(grammarsTable.id, id))
                            .limit(1)
    const wrongOption = db.select({
                                grammar: grammarsTable.grammar, 
                                meaning: grammarsTable.meaning,
                                isCorrect: sql`false`
                            })
                            .from(grammarsTable)
                            .leftJoin(setsTable, eq(grammarsTable.set_id, setsTable.id))
                            .leftJoin(usersTable, eq(setsTable.user_id, usersTable.id))
                            .where(and(
                                ne(grammarsTable.grammar, grammar), 
                                ne(grammarsTable.meaning, meaning),
                                eq(setsTable.type, SetType.grammar),
                                eq(usersTable.id, user_id)
                            ))
                            .orderBy(sql`random()`)
                            .limit(5)
    let result = await union(correctOption, wrongOption)
    shuffle(result)
    return result
})