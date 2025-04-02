import { drizzle } from 'drizzle-orm/neon-http';
import { vocabulariesTable, grammarsTable, kanjisTable } from '~/server/db/schema';
import { SetType } from "~/types/type"

const db = drizzle(useRuntimeConfig().DB_URL);

export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)


    const { type } = {...requestBody}

    if (type === SetType.vocabulary) {
        const { word, pronunciation = "", meaning, example = "", set_id } = {...requestBody}

        const card: typeof vocabulariesTable.$inferInsert = {
            repetitions: 1,
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
    } else if (type === SetType.grammar) {
        const { grammar, structure = "", meaning, example = "", set_id } = {...requestBody}
        const card: typeof grammarsTable.$inferInsert = {
            repetitions: 1,
            grammar: grammar,
            meaning: meaning,
            example: example,
            set_id: set_id,
            structure: structure
        }

        try {
            await db.insert(grammarsTable).values(card)
        } catch(e) {
            throw createError({
                statusCode: 400,
                statusMessage: 'This grammar already exists',
            })
        }
    } else if (type === SetType.kanji) {
        const { word, meaning, example = "", set_id, pronunciation="", how_to_remember=""} = {...requestBody}
        const card: typeof kanjisTable.$inferInsert = {
            repetitions: 1,
            word: word,
            meaning: meaning,
            pronunciation: pronunciation,
            example: example,
            set_id: set_id,
            how_to_remember: how_to_remember
        }

        try {
            await db.insert(kanjisTable).values(card)
        } catch(e) {
            throw createError({
                statusCode: 400,
                statusMessage: 'This kanji already exists',
            })
        }
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid type',
        })
    }
})