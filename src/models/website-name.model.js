import mongoose, { Schema } from 'mongoose';

const websiteNameSchema = new Schema(
	{
		value: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const WebsiteName = mongoose.model('WebsiteName', websiteNameSchema);

export default WebsiteName;
