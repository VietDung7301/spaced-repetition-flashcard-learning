import { drizzle } from 'drizzle-orm/neon-http';
import { and, eq } from 'drizzle-orm';
import { setsTable } from '~/server/db/schema';

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) =>{
    const user_id = (getQuery(event).user_id) as number
    const type = (getQuery(event).type) as number

    if (type === undefined) {
        const result = await db.select()
            .from(setsTable)
            .where(eq(setsTable.user_id, user_id))
        return result
    } else {
        const result = await db.select()
            .from(setsTable)
            .where(and(
                eq(setsTable.user_id, user_id),
                eq(setsTable.type, type))
            )
        return result
    }
})