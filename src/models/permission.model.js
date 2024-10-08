import mongoose, { Schema } from 'mongoose';

const permissionSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		value: {
			type: String,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

const PermissionModel = mongoose.model('Permission', permissionSchema);

export default PermissionModel;
