import mongoose, { Schema } from 'mongoose';

const routesSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		route: {
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

const Routes = mongoose.model('Routes', routesSchema);

export default Routes;
