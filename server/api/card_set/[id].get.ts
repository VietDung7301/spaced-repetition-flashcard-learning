import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { vocabulariesTable, grammarsTable, kanjisTable, setsTable } from '~/server/db/schema';
import { SetType } from '~/types/type'

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) => {
    const setId = getRouterParam(event, 'id') as unknown as number
    const set = await db.select()
                            .from(setsTable)
                            .where(eq(setsTable.id, setId))
    
    if (!set) {
        return []
    }
    if (set[0].type === SetType.vocabulary) {
        const result = await db.select()
                                .from(vocabulariesTable)
                                .where(eq(vocabulariesTable.set_id, setId))
                                .orderBy(vocabulariesTable.id)
        return {
            type: SetType.vocabulary,
            cards: result
        }
    } else if (set[0].type === SetType.grammar) {
        const result = await db.select()
                                .from(grammarsTable)
                                .where(eq(grammarsTable.set_id, setId))
                                .orderBy(grammarsTable.id)
        return {
            type: SetType.grammar,
            cards: result
        }
    } else {
        const result = await db.select()
                                .from(kanjisTable)
                                .where(eq(kanjisTable.set_id, setId))
                                .orderBy(kanjisTable.id)
        return {
            type: SetType.kanji,
            cards: result
        }
    }
})