import type { PageServerLoad } from './$types';
import { google } from 'googleapis';
import parseMessage from "gmail-api-parse-message";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.BASE_URL}/api/gmail`
);

export const load = (async () => {
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
	const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

	// Get calendar events
	const today = new Date();

	const events = await calendar.events.list({
		calendarId: 'primary',
		timeMin: today.toISOString(),
		singleEvents: true,
		orderBy: 'startTime',
	});

	// Get emails
	const res = await gmail.users.messages.list({
		userId: 'me',
		maxResults: 10
	});
	if (res.data?.messages) {
		const messages = await Promise.all(
			res.data.messages.map(async (message) => {
				const msg = await gmail.users.messages.get({
					userId: 'me',
					id: message.id || ""
				});
				return parseMessage(msg.data);
			})
		);
		return { events: events.data.items, messages };
	} else {
		throw new Error('No messages found');
	}
}) satisfies PageServerLoad;
