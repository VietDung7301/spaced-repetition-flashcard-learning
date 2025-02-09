import { drizzle } from 'drizzle-orm/neon-http';
import { vocabulariesTable } from '~/server/db/schema';
import { except } from 'drizzle-orm/mysql-core';

const db = drizzle(useRuntimeConfig().DB_URL);

export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)


    const {word, pronunciation = "", meaning, example = "", set_id} = {...requestBody}

    const card: typeof vocabulariesTable.$inferInsert = {
        word: word,
        pronunciation: pronunciation,
        meaning: meaning,
        example: example,
        set_id: set_id
    }

    try {
        await db.insert(vocabulariesTable).values(card)
    } catch(e) {
        throw createError({
            statusCode: 400,
            statusMessage: 'This word already exists',
        })
    }
})