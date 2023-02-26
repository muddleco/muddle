const popularEmailDomains = [
	'gmail.com',
	'yahoo.com',
	'hotmail.com',
	'outlook.com',
	'aol.com',
	'icloud.com',
	'live.com',
	'comcast.net',
	'msn.com',
	'verizon.net',
	'me.com',
	'att.net',
	'mac.com',
	'mail.com'
];

export default function extractDomainFromEmail(email: string): string | null {
	const atIndex = email.indexOf('@');
	if (atIndex === -1) {
		return null; // email is invalid
	}
	const domain = email.slice(atIndex + 1);
	if (popularEmailDomains.includes(domain)) {
		return null; // email domain is a popular consumer email service
	}
	return domain; // email domain is not a popular consumer email service
}
