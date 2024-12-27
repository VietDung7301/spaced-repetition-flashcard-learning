import { drizzle } from 'drizzle-orm/neon-http';
import { cardsTable } from '../../../db/schema';
import { eq } from 'drizzle-orm';

const db = drizzle(useRuntimeConfig().DB_URL);

export default defineEventHandler( async(event) =>{
    const cardId = getRouterParam(event, 'id') as unknown as number

    try {
        await db.delete(cardsTable).where(eq(cardsTable.id, cardId))
    } catch (exception) {
        console.log("exception", exception)
    }
})