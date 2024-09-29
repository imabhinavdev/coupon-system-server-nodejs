import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export const sendMail = async (to, subject, text, html) => {
	try {
		const CLIENT_ID = process.env.CLIENT_ID;
		const CLIENT_SECRET = process.env.CLIENT_SECRET;
		const REDIRECT_URI = process.env.REDIRECT_URI;
		const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
		const EMAIL = process.env.EMAIL;

		const oAuth2Client = new google.auth.OAuth2(
			CLIENT_ID,
			CLIENT_SECRET,
			REDIRECT_URI,
		);
		oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

		const { token } = await oAuth2Client.getAccessToken();

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				type: 'OAuth2',
				user: EMAIL,
				clientId: CLIENT_ID,
				clientSecret: CLIENT_SECRET,
				refreshToken: REFRESH_TOKEN,
				accessToken: token, // Ensure token is a string
			},
		});

		const mailOptions = {
			from: 'Coupon System<no-reply@imabhinav.dev>',
			to,
			subject,
			text,
			html,
		};

		const result = await transporter.sendMail(mailOptions);
		console.log('Email sent:', result);
		return result;
	} catch (error) {
		console.error(
			'Error sending email:',
			error.response ? error.response.body : error,
		);
		throw error;
	}
};
