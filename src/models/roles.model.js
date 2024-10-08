import mongoose, { Schema } from 'mongoose';

const roleSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		permissions: {
			type: [Schema.Types.ObjectId],
			ref: 'Permission',
			default: [],
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

const RoleModel = mongoose.model('Role', roleSchema);
export default RoleModel;
