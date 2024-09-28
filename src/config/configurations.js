import { config as configure } from 'dotenv';

configure();

export const config = {
	port: process.env.PORT,
	dbUrl: process.env.MONGODB_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
	RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};
