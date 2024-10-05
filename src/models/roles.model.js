import { Schema } from 'mongoose';

const roleSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		permissions: {
			type: [Schema.Types.ObjectId],
			ref: 'Routes',
			default: [],
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

const Role = mongoose.model('Role', roleSchema);
export default Role;
