/** @type {import('./$types').RequestHandler} */
import { MeiliSearch } from 'meilisearch';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const GET = async ({url}) => {
    const query = await url.searchParams.get('query');

	// Get user's app key from the database
	const userId = 1;
	const search = await prisma.app.findFirst({
		where: {
			type: 'SEARCH',
			user: { id: userId }
		}
	});

	const client = new MeiliSearch({ host: process.env.MEILISEARCH_HOST || "", apiKey: search?.key?.token || "" });

	const messages = await client.index('messages').search(query, {limit: 100});

	return new Response(JSON.stringify({messages: messages.hits}));
}
