import mongoose, { Schema } from 'mongoose';

const footerSchema = new Schema(
	{
		value: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const Footer = mongoose.model('Footer', footerSchema);

export default Footer;
