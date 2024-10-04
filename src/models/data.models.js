import mongoose, { Schema } from 'mongoose';

const dataSchema = new Schema(
	{
		key: {
			type: String,
			required: true,
		},
		value: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const Data = mongoose.model('Data', dataSchema);
export default Data;
