import Coupon from '../models/coupon.model.js';
import CouponCategory from '../models/coupon-category.model.js';
import Transaction from '../models/transactions.model.js';

export const getCoupons = async (req, res) => {
	const userId = req.query.user_id;
	const isUsed = req.query.is_used;
	const date = req.query.date;
	if (date === 'today') {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		try {
			const coupons = await Coupon.find({
				createdAt: { $gte: today },
				isUsed: true,
			})
				.populate('couponCategoryId')
				.populate('userId', 'name email');
			return res.status(200).json({ coupons });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	} else if (date) {
		const dateObj = new Date(date);
		dateObj.setHours(0, 0, 0, 0);
		try {
			const coupons = await Coupon.find({
				createdAt: { $gte: dateObj },
				isUsed: true,
			})
				.populate('couponCategoryId')
				.populate('userId', 'name email');
			return res.status(200).json({ coupons });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	}
	try {
		let query = {};
		if (isUsed) {
			query.isUsed = isUsed;
		}
		if (userId) {
			query.userId = userId;
		}

		const coupons = await Coupon.find(query).populate('couponCategoryId');

		res.status(200).json({ coupons });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

// Verify a coupon
export const verifyCoupon = async (req, res) => {
	const id = req.params.id;
	const { scannedBy } = req.body;

	try {
		const coupon = await Coupon.findById(id);
		if (!coupon) {
			return res.status(404).json({ message: 'Coupon not found' });
		}
		if (coupon.isUsed) {
			return res.status(400).json({ message: 'Coupon already used' });
		}

		// Make is_used true
		coupon.isUsed = true;
		coupon.scannedBy = scannedBy;
		await coupon.save();
		res.status(200).json({
			message: 'Coupon verified successfully',
			noOfPerson: coupon.noOfPerson,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

// assign coupon to user from admin
export const assignCoupon = async (req, res) => {
	try {
		const { userId, couponCategoryId, noOfPerson, isVisitor } = req.body;
		const days = [
			'sunday',
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday',
		];
		const day = days[new Date().getDay()];

		console.log(userId, couponCategoryId, noOfPerson);
		Object.keys(req.body).forEach((key) => {
			if (!req.body[key]) {
				return res.status(400).json({ message: `${key} is required` });
			}
		});
		const couponCategory = await CouponCategory.findById(couponCategoryId);
		if (!couponCategory) {
			return res.status(404).json({ message: 'Coupon category not found' });
		}

		let paymentMode = 'offline';
		if (isVisitor) {
			paymentMode = 'visitor';
		}

		const transaction = await Transaction.create({
			userId,
			amount: couponCategory.price * noOfPerson,
			couponCategoryId,
			status: 'success',
			orderId: `cash-order-${Date.now()}`,
			paymentMode: paymentMode,
		});

		if (!transaction) {
			return res.status(500).json({ message: 'Transaction failed' });
		}
		// get today's day like monday, tuesday etc

		// create coupon
		const coupon = await Coupon.create({
			userId,
			couponCategoryId,
			noOfPerson,
			transactionId: transaction._id,
			day,
		});

		res.status(200).json({ message: 'Coupon assigned successfully', coupon });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

// Get coupon statistics
export const getCouponStats = async (req, res) => {
	try {
		const stats = await Coupon.aggregate([
			{
				$group: {
					_id: null,
					used: { $sum: { $cond: ['$is_used', 1, 0] } },
					unused: { $sum: { $cond: ['$is_used', 0, 1] } },
				},
			},
		]);

		res.status(200).json({ coupon_stats: stats[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

// Get users per coupon category
export const getUsersPerCouponCategory = async (req, res) => {
	try {
		const usersPerCategory = await Coupon.aggregate([
			{
				$lookup: {
					from: 'couponcategories', // Collection name in MongoDB
					localField: 'coupon_category_id',
					foreignField: '_id',
					as: 'category',
				},
			},
			{
				$unwind: '$category',
			},
			{
				$group: {
					_id: '$category.name',
					users: { $addToSet: '$user_id' },
				},
			},
			{
				$project: {
					category: '$_id',
					users: { $size: '$users' },
				},
			},
			{ $sort: { users: -1 } },
		]);

		res.status(200).json({ users_per_category: usersPerCategory });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

// Get coupons used per day
export const getCouponsUsedPerDay = async (req, res) => {
	const { from, to } = req.query;

	try {
		const query = {
			is_used: true,
		};

		if (from && to) {
			query.updated_at = { $gte: new Date(from), $lte: new Date(to) };
		}

		const usedPerDay = await Coupon.aggregate([
			{
				$match: query,
			},
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$updated_at' } },
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.status(200).json({ coupons_used_per_day: usedPerDay });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

// Get coupon stats by weekday
export const getCouponStatsByWeekday = async (req, res) => {
	const last30Days = new Date();
	last30Days.setDate(last30Days.getDate() - 30);

	try {
		const couponStatsByWeekday = await Coupon.aggregate([
			{
				$match: {
					createdAt: { $gte: last30Days },
					createdAt: { $ne: null }, // Ensure that createdAt is not null
				},
			},
			{
				$lookup: {
					from: 'transactions',
					localField: 'transactionId',
					foreignField: '_id',
					as: 'transaction',
				},
			},
			{
				$unwind: '$transaction',
			},
			{
				$group: {
					_id: { $dayOfWeek: '$createdAt' }, // Use createdAt for grouping
					coupons_sold: { $sum: 1 },
					revenue: { $sum: '$transaction.amount' }, // Summing revenue from transactions
				},
			},
			{ $sort: { _id: 1 } },
		]);

		if (couponStatsByWeekday.length === 0) {
			return res
				.status(200)
				.json({ message: 'No coupons found in the last 30 days' });
		}

		const response = {};
		couponStatsByWeekday.forEach((stat) => {
			response[stat._id] = {
				coupons_sold: stat.coupons_sold,
				revenue: stat.revenue,
			};
		});

		res.status(200).json({ coupon_stats_by_weekday: response });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

// send coupons of today which are used
export const getTodaysUsedCoupons = async (req, res) => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	try {
		const usedCoupons = await Coupon.find({
			isUsed: true,
			updatedAt: { $gte: today },
		});

		res.status(200).json({ used_coupons: usedCoupons });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};
