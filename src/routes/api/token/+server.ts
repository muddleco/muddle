/** @type {import('./$types').RequestHandler} */
import { MeiliSearch } from 'meilisearch';
const client = new MeiliSearch({ host: process.env.MEILISEARCH_HOST || "", apiKey: process.env.MEILISEARCH_API_KEY });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST() {
	const searchRules = {
		messages: {
			filter: 'user = 1'
		}
	};

	const token = await client.generateTenantToken(process.env.MEILISEARCH_API_KEY_UID || "", searchRules, {
		apiKey: process.env.MEILISEARCH_API_KEY
	});
    
    await prisma.app.create({
        data: {
            type: "SEARCH",
            key: {"token": token},
            user: {
                connect: { id: 1 }
            }
        }
    })

    return new Response(JSON.stringify({message: "Success"}));
}
