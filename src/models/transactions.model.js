import mongoose, { Schema } from 'mongoose';

const transactionSchema = new Schema({
	amount: {
		type: Number,
		required: true,
	},
	paymentId: {
		type: String,
	},
	orderId: {
		type: String,
		required: true,
	},
	isCaptured: {
		type: Boolean,
		default: false,
	},
	signature: {
		type: String,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
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
