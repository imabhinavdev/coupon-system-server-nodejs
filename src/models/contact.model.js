import mongoose, { Schema } from 'mongoose';
import { sendMail } from '../utils/mailer.util.js';
const contactSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		subject: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

contactSchema.methods.sendEmailToAdmin = function () {
	const { name, email, phone, message,subject } = this;
	const text = `You have received a new message from ${name} with email ${email} and phone number ${phone}.The subject is ${subject}. The message is: ${message}`;
	const html = `<p>You have received a new message from <strong>${name}</strong> with email <strong>${email}</strong> and phone number <strong>${phone}</strong>.The subject is: <br> ${subject} <br><br> The message is: <br><br> <strong>${message}</strong></p>`;
	return sendMail('abhinavas430@gmail.com', subject, text, html);
};

contactSchema.methods.sendEmailToUser = function () {
	const { name, email } = this;
	const subject = `Thank you for contacting us, ${name}`;
	const text = `Hello ${name}, \n\nThank you for contacting us. We will get back to you soon. \n\nRegards, \nTeam`;
	const html = `<p>Hello <strong>${name}</strong>, <br><br> Thank you for contacting us. We will get back to you soon. <br><br> Regards, <br> Team</p>`;
	return sendMail(email, subject, text, html);
};

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
