/** @type {import('./$types').Actions} */

import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.BASE_URL}/api/gmail`
);

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const to = data.get('to');
        const subject = data.get('subject');
        const message = data.get('message');

		// Get user's app key from the database
		const userId = 1;
		const app = await prisma.app.findFirst({
			where: {
				type: 'GOOGLE',
				user: { id: userId }
			}
		});

		const user = await prisma.user.findFirst({
			where: {
				id: userId
			}
		});

		// Set the OAuth2 client credentials
		oAuth2Client.setCredentials({
			access_token: app?.key?.access_token,
			refresh_token: app?.key?.refresh_token
		});

		const email = ['From: ' + user?.email, 'To: ' + to, 'Subject: ' + subject, '', message]
			.join('\r\n')
			.trim();

		const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

		try {
			gmail.users.messages.send({
				userId: 'me',
				requestBody: {
					raw: Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
				}
			});
			return {success: true};
		} catch (error) {
			console.error(error);
			return {success: false, error: error};
		}
	}
};
