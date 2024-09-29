import mongoose, { Schema } from 'mongoose';

const couponSchema = new Schema({
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
	isUsed: {
		type: Boolean,
		default: false,
	},
	scannedBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},

	day: {
		type: String,
	},
	transactionId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Transaction',
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

couponSchema.pre('save', function (next) {
	this.updatedAt = Date.now();
	next();
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
