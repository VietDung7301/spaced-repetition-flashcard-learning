import { drizzle } from 'drizzle-orm/neon-http';
import { cardsTable } from '../db/schema';

const db = drizzle(useRuntimeConfig().DB_URL);

export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)

    const {word, pronunciation = "", meaning, example = "", list_id} = {...requestBody}

    const card: typeof cardsTable.$inferInsert = {
        word: word,
        pronunciation: pronunciation,
        meaning: meaning,
        example: example,
        list_id: list_id
    }

    await db.insert(cardsTable).values(card)
})