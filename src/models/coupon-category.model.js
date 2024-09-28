import mongoose, { Schema } from 'mongoose';

const couponCategorySchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	isActive: {
		type: Boolean,
		required: true,
		default: true,
	},
	price: {
		type: Number,
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

couponCategorySchema.pre('save', function (next) {
	this.updatedAt = Date.now();
	next();
});

const CouponCategory = mongoose.model('CouponCategory', couponCategorySchema);
export default CouponCategory;
