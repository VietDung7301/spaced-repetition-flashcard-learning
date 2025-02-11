import { drizzle } from 'drizzle-orm/neon-http';
import { vocabulariesTable, kanjisTable, grammarsTable } from '~/server/db/schema';
import { SetType } from "~/types/type"
import { eq } from 'drizzle-orm';

const db = drizzle(useRuntimeConfig().DB_URL);

export default defineEventHandler( async(event) =>{
    const cardId = getRouterParam(event, 'id') as unknown as number
    const type = (getQuery(event).type) as number

    try {
        if (type === SetType.vocabulary)
            await db.delete(vocabulariesTable).where(eq(vocabulariesTable.id, cardId))
        else if (type === SetType.grammar)
            await db.delete(grammarsTable).where(eq(grammarsTable.id, cardId))
        else if (type === SetType.kanji)
            await db.delete(kanjisTable).where(eq(kanjisTable.id, cardId))
        else {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid type',
            })
        }
    } catch (exception) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Something went wrong!',
        })
    }
})