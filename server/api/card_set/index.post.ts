import { drizzle } from 'drizzle-orm/neon-http';
import { setsTable } from '~/server/db/schema';

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) =>{
    const requestBody = await readBody(event)

    const {name, user_id, type} = {...requestBody}

    const list: typeof setsTable.$inferInsert = {
        name: name,
        user_id: user_id,
        type: type
    }

    await db.insert(setsTable).values(list)
})