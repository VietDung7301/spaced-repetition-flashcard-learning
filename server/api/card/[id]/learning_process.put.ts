import { drizzle } from 'drizzle-orm/neon-http';
import { vocabulariesTable, grammarsTable, kanjisTable } from '~/server/db/schema';
import { sql, eq } from 'drizzle-orm';
import { SetType } from "~/types/type"

const db = drizzle(useRuntimeConfig().DB_URL);

export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)
    const cardId = getRouterParam(event, 'id') as unknown as number

    let {isCorrect, repetitions, interval, ease_factor, type} = {...requestBody}

    if (isCorrect) {
        if (repetitions == 0) {
            interval = 1
        } else if (repetitions == 1) {
            interval = 6
        } else {
            interval = Math.round(interval * ease_factor)
        }
        repetitions++
        ease_factor = ease_factor + 0.1
    } else {
        repetitions = 0
        interval = 1
    }

    try {
        if (type === SetType.vocabulary) {
            const result = await db.update(vocabulariesTable)
                .set({
                    interval: interval,
                    repetitions: repetitions,
                    ease_factor: ease_factor,
                    next_study_time: sql`NOW() + interval '${sql.raw(interval)} hours'`
                })
                .where(eq(vocabulariesTable.id, cardId))
                .returning({ 
                    word: vocabulariesTable.word,
                    id: vocabulariesTable.id,
                    next_study_time: vocabulariesTable.next_study_time
                })
            return result
        } else if (type === SetType.grammar) {
            const result = await db.update(grammarsTable)
                .set({
                    interval: interval,
                    repetitions: repetitions,
                    ease_factor: ease_factor,
                    next_study_time: sql`NOW() + interval '${sql.raw(interval)} hours'`
                })
                .where(eq(grammarsTable.id, cardId))
                .returning({ 
                    grammar: grammarsTable.grammar,
                    id: grammarsTable.id,
                    next_study_time: grammarsTable.next_study_time
                })
            return result
        } else if (type === SetType.kanji) {
            const result = await db.update(kanjisTable)
                .set({
                    interval: interval,
                    repetitions: repetitions,
                    ease_factor: ease_factor,
                    next_study_time: sql`NOW() + interval '${sql.raw(interval)} hours'`
                })
                .where(eq(kanjisTable.id, cardId))
                .returning({ 
                    word: kanjisTable.word,
                    id: kanjisTable.id,
                    next_study_time: kanjisTable.next_study_time
                })
            return result
        } else {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid type!',
            })
        }
    } catch (exception) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Something went wrong!',
        })
    }
})