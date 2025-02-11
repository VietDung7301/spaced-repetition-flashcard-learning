import { drizzle } from 'drizzle-orm/neon-http';
import { vocabulariesTable, grammarsTable, kanjisTable } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { SetType } from "~/types/type"

const db = drizzle(useRuntimeConfig().DB_URL);

export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)
    const cardId = getRouterParam(event, 'id') as unknown as number

    let { type } = {...requestBody}

    if (type === SetType.vocabulary) {
        let {word, meaning, pronunciation, example, set_id} = {...requestBody}
        try {
            await db.update(vocabulariesTable)
                .set({
                    word: word,
                    meaning: meaning,
                    pronunciation: pronunciation,
                    example: example,
                    set_id: set_id
                })
                .where(eq(vocabulariesTable.id, cardId))
        } catch (exception) {
            console.log(exception)
            throw createError({
                statusCode: 400,
                statusMessage: 'Something went wrong!',
            })
        }
    } else if (type === SetType.grammar) {
        let {grammar, example, meaning, set_id, structure} = {...requestBody}
        try {
            await db.update(grammarsTable)
                .set({
                    grammar: grammar,
                    example: example,
                    meaning: meaning,
                    set_id: set_id,
                    structure: structure
                })
                .where(eq(grammarsTable.id, cardId))
        } catch (exception) {
            console.log(exception)
            throw createError({
                statusCode: 400,
                statusMessage: 'Something went wrong!',
            })
        }
    } else if (type === SetType.kanji) {
        let {word, meaning, how_to_remember, pronunciation, example, set_id} = {...requestBody}
        try {
            await db.update(kanjisTable)
                .set({
                    word: word,
                    meaning: meaning,
                    how_to_remember: how_to_remember,
                    pronunciation: pronunciation,
                    example: example,
                    set_id: set_id
                })
                .where(eq(kanjisTable.id, cardId))
        } catch (exception) {
            console.log(exception)
            throw createError({
                statusCode: 400,
                statusMessage: 'Something went wrong!',
            })
        }
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid type!',
        })
    }
})
