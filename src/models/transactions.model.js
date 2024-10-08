import mongoose, { Schema } from 'mongoose';

const transactionSchema = new Schema({
	amount: {
		type: Number,
		required: true,
	},
	paymentId: {
		type: String,
		default: null,
	},
	orderId: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ['pending', 'success', 'failed'],
		default: 'failed',
	},
	signature: {
		type: String,
		default: null,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	paymentMode: {
		type: String,
		enum: ['online', 'offline', 'visitor'],
		default: 'online',
	},
	couponCategoryId: {
		type: Schema.Types.ObjectId,
		ref: 'CouponCategory',
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

transactionSchema.pre('save', function (next) {
	this.updatedAt = Date.now();
	next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
