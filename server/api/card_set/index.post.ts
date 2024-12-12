import { drizzle } from 'drizzle-orm/neon-http';
import { cardSetsTable } from '../../db/schema';

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)

    const {name, user_id} = {...requestBody}

    const list: typeof cardSetsTable.$inferInsert = {
        name: name,
        user_id: user_id
    }

    await db.insert(cardSetsTable).values(list)
})