import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.BASE_URL}/api/gmail`
);

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
				addLabelIds: ['STARRED']
			}
		});
		return new Response(JSON.stringify({ message: 'Success' }));
	} catch (err) {
		return new Response(JSON.stringify({ message: 'Success', error: err }));
	}
};
