import { drizzle } from 'drizzle-orm/neon-http';
import { vocabulariesTable } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

const db = drizzle(useRuntimeConfig().DB_URL);

export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)
    const cardId = getRouterParam(event, 'id') as unknown as number

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
        console.log("exception", exception)
    }
})
