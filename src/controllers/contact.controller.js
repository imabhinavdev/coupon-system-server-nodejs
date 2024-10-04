import Contact from '../models/contact.model.js';

export const createContactFormResponse = async (req, res) => {
	const { email, name, phone, subject, message } = req.body;
	const requiredFields = { email, name, phone, subject, message };
	for (const [key, value] of Object.entries(requiredFields)) {
		if (!value) {
			return res.status(400).json({
				message: `${key} is required`,
			});
		}
	}
	try {
		const contact = await Contact.create({
			email,
			name,
			phone,
			subject,
			message,
		});

		if (!contact) {
			return res.status(400).json({
				message: 'Something went wrong',
			});
		}

		const emailSendToAdmin = await contact.sendEmailToAdmin();
		const emailSendToUser = await contact.sendEmailToUser();

		return res.status(200).json({
			message: 'Contact form submitted successfully',
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: 'Internal server error',
		});
	}
};
