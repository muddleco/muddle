import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.BASE_URL}/api/gmail`
);

export const POST = async () => {
	// Generate the URL for the user to authorize
	const authorizeUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: [
			'https://www.googleapis.com/auth/gmail.modify',
			'https://www.googleapis.com/auth/calendar.events'
		]
	});

	// Redirect the user to the authorize URL
	return new Response(JSON.stringify({ url: authorizeUrl }));
};

export const GET = async ({url}) => {
	// Get the authorization code from the query parameters
	const code = url.searchParams.get("code");

	// Exchange the authorization code for an access token and refresh token
	const { tokens } = await oAuth2Client.getToken(code);
	oAuth2Client.setCredentials(tokens);

	// Store the tokens in the database
	const userId = 1;
	const { access_token, refresh_token, expiry_date } = tokens;
	await prisma.app.create({
		data: {
            type: "GOOGLE",
			user: { connect: { id: userId } },
			key: {"access_token": access_token, "refresh_token": refresh_token, "expiry_date": expiry_date},
		}
	});

	// Redirect the user to the root page
	return new Response(JSON.stringify({ message: 'Success' }));
};
