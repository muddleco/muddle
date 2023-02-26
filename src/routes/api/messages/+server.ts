import { MeiliSearch } from 'meilisearch';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const GET = (async () => {
	// Get user's app key from the database
	const userId = 1;
	const search = await prisma.app.findFirst({
		where: {
			type: 'SEARCH',
			user: { id: userId }
		}
	});

	const client = new MeiliSearch({
		host: process.env.MEILISEARCH_HOST || '',
		apiKey: search?.key?.token || ''
	});

	const messages = await client.index('messages').search('', { limit: 100 });

	return new Response(JSON.stringify({ messages: messages.hits.sort((a, b) => new Date(b.date) - new Date(a.date)) }));
});
