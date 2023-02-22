import { google } from 'googleapis';
import { MeiliSearch } from 'meilisearch';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.BASE_URL}/api/gmail`
);

const client = new MeiliSearch({
	host: process.env.MEILISEARCH_HOST || '',
	apiKey: process.env.MEILISEARCH_API_KEY || ''
});

export const POST = async ({ url }) => {
	// Get the message ID from the query parameters
	const message = url.searchParams.get('message');

	// Get user's app key from the database
	const userId = 1;
	const app = await prisma.app.findFirst({
		where: {
			type: 'GOOGLE',
			user: { id: userId }
		}
	});

	// Set the OAuth2 client credentials
	oAuth2Client.setCredentials({
		access_token: app?.key?.access_token,
		refresh_token: app?.key?.refresh_token
	});

	const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

	try {
		await gmail.users.messages.modify({
			userId: 'me',
			id: message,
			resource: {
				removeLabelIds: ['UNREAD']
			}
		});
		const readMessage = await client.index('messages').search(message);
		const labels = readMessage.hits[0].labels;
		const unreadIndex = labels.indexOf('UNREAD');
		if (unreadIndex !== -1) {
			labels.splice(unreadIndex, 1);
		}
		await client.index('messages').updateDocuments({
			id: readMessage.hits[0].id,
			labels: labels
		});
		return new Response(JSON.stringify({ message: 'Success' }));
	} catch (err) {
		return new Response(JSON.stringify({ message: 'Success', error: err }));
	}
};
