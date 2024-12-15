import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { cardSetsTable } from '../../db/schema';

const db = drizzle(useRuntimeConfig().DB_URL);


export default defineEventHandler( async(event) =>{
    console.log("running hereree")
    const user_id = (getQuery(event).user_id) as number
    const result = await db.select().from(cardSetsTable).where(eq(cardSetsTable.user_id, user_id))
    console.log(result)
    return result
})