import { drizzle } from 'drizzle-orm/neon-http';
import { listsTable } from '../db/schema';

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)

    const {name, user_id} = {...requestBody}

    const list: typeof listsTable.$inferInsert = {
        name: name,
        user_id: user_id
    }

    await db.insert(listsTable).values(list)
})