import CouponCategory from '../models/coupon-category.model.js'; // Assuming this is the model for coupon categories
import Transaction from '../models/transactions.model.js'; // Assuming this is the model for transactions
import Razorpay from 'razorpay'; // Assuming Razorpay is set up correctly
import dotenv from 'dotenv';
import { config } from '../config/configurations.js';
import { randomUUID } from 'crypto';
import crypto from 'crypto';
import Coupon from '../models/coupon.model.js';
dotenv.config();

const razorpayInstance = new Razorpay({
	key_id: config.RAZORPAY_KEY_ID,
	key_secret: config.RAZORPAY_KEY_SECRET,
});

export const generateOrder = async (req, res) => {
	const { coupon_category_id, user_id, coupon_category_price } = req.body;

	if (!coupon_category_id || !user_id) {
		return res.status(400).json({
			message: 'Coupon ID and User ID are required',
		});
	}

	const price = parseInt(coupon_category_price);

	const couponCategory = await CouponCategory.findById(coupon_category_id);
	if (!couponCategory) {
		return res.status(404).json({
			message: 'Coupon category not found',
		});
	}


	const receipt = randomUUID();
	const data = {
		amount: price * 100,
		currency: 'INR',
		receipt: receipt,
	};

	try {
		const order = await razorpayInstance.orders.create(data);

		// Create a new transaction
		const transaction = await Transaction.create({
			amount: price,
			orderId: order.id,
			userId: user_id,
			couponCategoryId: couponCategory._id,
			signature: '',
		});

		return res.status(200).json({
			message: 'Order created successfully',
			data: {
				...order,
				coupon_category_id: couponCategory._id,
				coupon_category_name: couponCategory.name,
				transaction_id: transaction._id,
			},
		});
	} catch (err) {
		console.error('Error while creating order:', err);
		return res.status(500).json({
			message: 'Internal server error',
		});
	}
};

export const verifySignature = async (req, res) => {
	const {
		razorpay_payment_id,
		razorpay_order_id,
		razorpay_signature,
		transaction_id,
	} = req.body;

	if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
		return res.status(400).json({
			message:
				'razorpay_payment_id, razorpay_order_id, and razorpay_signature are required',
		});
	}

	const secret = process.env.RAZORPAY_KEY_SECRET;

	const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
	const expectedSignature = crypto
		.createHmac('sha256', secret)
		.update(payload)
		.digest('hex');

	if (expectedSignature !== razorpay_signature) {
		return res.status(400).json({
			message: 'Signature verification failed',
			expected: expectedSignature,
			received: razorpay_signature,
		});
	}

	const transaction = await Transaction.findById(transaction_id);
	if (!transaction) {
		return res.status(404).json({
			message: 'Transaction not found',
		});
	}

	transaction.signature = razorpay_signature;
	transaction.paymentId = razorpay_payment_id;
	transaction.isCaptured = true;

	await transaction.save();

	const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });
	const newCoupon = await Coupon.create({
		userId: transaction.userId,
		couponCategoryId: transaction.couponCategoryId,
		transactionId: transaction._id,
		day: currentDay,
	});

	const couponWithDetails = await Coupon.findById(newCoupon._id).populate(
		'couponCategoryId',
	);

	return res.status(200).json({
		message: 'Coupon generated successfully',
		data: {
			id: couponWithDetails._id,
			coupon_category_id: couponWithDetails.couponCategoryId._id,
			coupon_category_name: couponWithDetails.couponCategoryId.name,
			coupon_category_price: couponWithDetails.couponCategoryId.price,
			is_used: couponWithDetails.isUsed,
			day: couponWithDetails.day,
			transaction_id: couponWithDetails.transactionId,
			user_id: couponWithDetails.userId,
		},
	});
};
