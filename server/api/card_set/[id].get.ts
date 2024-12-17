import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { cardsTable } from '../../db/schema';

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) => {
    const setId = getRouterParam(event, 'id') as unknown as number
    const result = await db.select()
                            .from(cardsTable)
                            .where(eq(cardsTable.set_id, setId))
    return result
})