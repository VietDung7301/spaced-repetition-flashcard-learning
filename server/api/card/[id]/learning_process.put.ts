import { drizzle } from 'drizzle-orm/neon-http';
import { cardsTable } from '../../../db/schema';
import { sql, eq } from 'drizzle-orm';

const db = drizzle(useRuntimeConfig().DB_URL);

export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)
    const cardId = getRouterParam(event, 'id') as unknown as number

    let {isCorrect, repetitions, interval, ease_factor} = {...requestBody}

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
        const result = await db.update(cardsTable)
            .set({
                interval: interval,
                repetitions: repetitions,
                ease_factor: ease_factor,
                next_study_time: sql`NOW() + interval '${sql.raw(interval)} hours'`
            })
            .where(eq(cardsTable.id, cardId))
            .returning({ 
                word: cardsTable.word,
                id: cardsTable.id,
                next_study_time: cardsTable.next_study_time
            })
        return result
    } catch (exception) {
        console.log("exception", exception)
    }
})