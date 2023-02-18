/** @type {import('./$types').RequestHandler} */
import { google } from 'googleapis';
import parseMessage from 'gmail-api-parse-message';
import { PrismaClient } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
const prisma = new PrismaClient();

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.BASE_URL}/api/gmail`
);

export async function POST() {
	// Get user's app key from the database
	const userId = 1;
	const app = await prisma.app.findFirst({
		where: {
			type: 'GOOGLE',
			user: { id: userId }
		}
	});

	const client = new MeiliSearch({
		host: process.env.MEILISEARCH_HOST || '',
		apiKey: process.env.MEILISEARCH_API_KEY || ''
	});

	// Set the OAuth2 client credentials
	oAuth2Client.setCredentials({
		access_token: app?.key?.access_token,
		refresh_token: app?.key?.refresh_token
	});

	const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

	const existingMessages = await client.index('messages').search('', {
		filter: ['user = ' + userId]
	});

	// Get emails
	if (existingMessages.hits.length > 0) {
		// Use historyId to get new messages
		console.log("Found existing messages, using historyId to get new messages");
		const res = await gmail.users.history.list({
			userId: 'me',
			startHistoryId: existingMessages.hits[0].historyId
		});

		if (res.data?.history) {
			const messageIds = res.data.history.map((historyRecord) => historyRecord.messages.map((message) => message.id));
  			const allMessageIds = ([] as string[]).concat(...messageIds);
			const messages = await Promise.all(
				allMessageIds.map(async (messageId) => {
					const msg = await gmail.users.messages.get({
						userId: 'me',
						id: messageId || ''
					});
					const parsedMessage = parseMessage(msg.data);
	
					return {
						id: parsedMessage.id,
						historyId: parsedMessage.historyId,
						user: userId,
						date: parsedMessage.headers.date,
						from: parsedMessage.headers.from,
						labels: parsedMessage.labelIds,
						subject: parsedMessage.headers.subject,
						snippet: parsedMessage.snippet,
						body: parsedMessage.textHtml || parsedMessage.textPlain || ''
					};
				})
			);
			await client
				.index('messages')
				.addDocuments(messages)
				.then((res) => console.log(res));
			await client.index('messages').updateFilterableAttributes(['user']);
			return new Response(JSON.stringify({ message: 'Success' }));
		} else {
			throw new Error('No messages found');
		}
	} else {
		console.log("No existing messages, getting all messages");
		const res = await gmail.users.messages.list({
			userId: 'me'
		});

		if (res.data?.messages) {
			const messages = await Promise.all(
				res.data.messages.map(async (message) => {
					const msg = await gmail.users.messages.get({
						userId: 'me',
						id: message.id || ''
					});
					const parsedMessage = parseMessage(msg.data);
	
					return {
						id: parsedMessage.id,
						historyId: parsedMessage.historyId,
						user: userId,
						date: parsedMessage.headers.date,
						from: parsedMessage.headers.from,
						labels: parsedMessage.labelIds,
						subject: parsedMessage.headers.subject,
						snippet: parsedMessage.snippet,
						body: parsedMessage.textHtml || parsedMessage.textPlain || ''
					};
				})
			);
			await client
				.index('messages')
				.addDocuments(messages)
				.then((res) => console.log(res));
			await client.index('messages').updateFilterableAttributes(['user']);
			return new Response(JSON.stringify({ message: 'Success' }));
		} else {
			throw new Error('No messages found');
		}
	}
}
