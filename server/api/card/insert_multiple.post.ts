import { drizzle } from 'drizzle-orm/neon-http';
import { vocabulariesTable, grammarsTable, kanjisTable } from '~/server/db/schema';
import { SetType } from "~/types/type"

const db = drizzle(useRuntimeConfig().DB_URL);

export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)
    const { type, set_id, cards } = {...requestBody}
    let result:any = []

    if (type === SetType.vocabulary) {
        try{
            result = await db.insert(vocabulariesTable).values(
                cards.map((card: string[]) => {
                    return {
                        repetitions: 1,
                        word: card[0],
                        pronunciation: card[1],
                        meaning: card[2],
                        example: card[3],
                        set_id: set_id
                    }
                })
            )
            .onConflictDoNothing()
            .returning({
                cardName: vocabulariesTable.word
            })
        } catch (e: any) {
            console.log("error", e.message)
            throw createError({
                statusCode: 400,
                statusMessage: `Failed to insert cards: ${e.message}`
            })
        }
    } else if (type === SetType.grammar) {
        try {
            result = await db.insert(grammarsTable).values(
                cards.map((card: string[]) => {
                    return {
                        repetitions: 1,
                        grammar: card[0],
                        structure: card[1],
                        meaning: card[2],
                        example: card[3],
                        set_id: set_id
                    }
                })
            )
            .onConflictDoNothing()
            .returning({
                cardName: grammarsTable.grammar
            })

        } catch (e: any) {
            console.log("error", e.message)
            throw createError({
                statusCode: 400,
                statusMessage: `Failed to insert cards: ${e.message}`
            })
        }
    } else if (type === SetType.kanji) {
        try {
            result = await db.insert(kanjisTable).values(
                cards.map((card: string[]) => {
                    return {
                        repetitions: 1,
                        word: card[0],
                        pronunciation: card[1],
                        meaning: card[2],
                        example: card[3],
                        set_id: set_id,
                        how_to_remember: card[4]
                    }
                })
            )
            .onConflictDoNothing()
            .returning({
                cardName: kanjisTable.word
            })
        } catch (e: any) {
            console.log("error", e.message)
            throw createError({
                statusCode: 400,
                statusMessage: `Failed to insert cards: ${e.message}`
            })
        }
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid card type: ${type}`
        })
    }

    return {
        message: 'Success',
        result: result
    }
})
