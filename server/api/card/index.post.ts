import { drizzle } from 'drizzle-orm/neon-http';
import { cardsTable } from '../../db/schema';

const db = drizzle(useRuntimeConfig().DB_URL);

export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)
    
    console.log(requestBody)

    const {word, pronunciation = "", meaning, example = "", set_id} = {...requestBody}

    const card: typeof cardsTable.$inferInsert = {
        word: word,
        pronunciation: pronunciation,
        meaning: meaning,
        example: example,
        set_id: set_id
    }

    await db.insert(cardsTable).values(card)
})