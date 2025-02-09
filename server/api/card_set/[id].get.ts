import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { vocabulariesTable } from '~/server/db/schema';

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) => {
    const setId = getRouterParam(event, 'id') as unknown as number
    const result = await db.select()
                            .from(vocabulariesTable)
                            .where(eq(vocabulariesTable.set_id, setId))
                            .orderBy(vocabulariesTable.id)
    return result
})