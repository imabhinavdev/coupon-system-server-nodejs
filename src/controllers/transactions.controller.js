import Transaction from '../models/transactions.model.js';
import moment from 'moment';

// Get transactions, with optional user filter and sorted by creation date
export const getTransactions = async (req, res) => {
	const userId = req.query.user_id;

	try {
		const transactions = userId
			? await Transaction.find({ userId: userId })
					.populate('couponCategoryId')
					.sort({ createdAt: -1 }) // Sorting by 'createdAt'
			: await Transaction.find({
					createdAt: { $gte: moment().subtract(30, 'days').toDate() },
				})
					.populate('couponCategoryId')
					.sort({ createdAt: -1 }); // Sorting by 'createdAt'

		res.status(200).json(transactions);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: error.message });
	}
};

// Get daily transaction statistics
export const getTransactionStats = async (req, res) => {
	let { from, to } = req.query;
	if (!from || !to) {
		to = moment().format('YYYY-MM-DD');
		from = moment().subtract(30, 'days').format('YYYY-MM-DD');
	}

	try {
		const transactions = await Transaction.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(from),
						$lte: new Date(to),
					},
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
					transactions: { $sum: 1 },
				},
			},
			{
				$sort: { _id: 1 },
			},
		]);

		const daysMap = {};
		transactions.forEach((t) => {
			daysMap[t._id] = t.transactions;
		});

		const result = [];
		for (
			let d = moment().subtract(30, 'days');
			!d.isAfter(moment());
			d.add(1, 'days')
		) {
			const dateStr = d.format('YYYY-MM-DD');
			result.push({ date: dateStr, transactions: daysMap[dateStr] || 0 });
		}

		res.status(200).json({ transactions: result });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get daily revenue statistics
export const getRevenueStats = async (req, res) => {
	let { from, to } = req.query;

	if (!from || !to) {
		to = moment().format('YYYY-MM-DD');
		from = moment().subtract(7, 'days').format('YYYY-MM-DD');
	}

	try {
		const startDate = new Date(from);
		const endDate = new Date(to);
		endDate.setHours(23, 59, 59, 999);

		const revenue = await Transaction.aggregate([
			{
				$match: {
					isCaptured: true,
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
					revenue: { $sum: '$amount' },
				},
			},
			{
				$sort: { _id: 1 },
			},
		]);

		const daysMap = revenue.reduce((map, r) => {
			map[r._id] = r.revenue;
			return map;
		}, {});

		const result = [];
		for (let i = 0; i < 7; i++) {
			const dateStr = moment()
				.subtract(6 - i, 'days')
				.format('YYYY-MM-DD');
			result.push({ date: dateStr, revenue: daysMap[dateStr] || 0 });
		}

		res.status(200).json({ revenue: result });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get transaction success rate (captured vs uncaptured)
export const getTransactionSuccessRate = async (req, res) => {
	try {
		const successRate = await Transaction.aggregate([
			{
				$group: {
					_id: null,
					captured: {
						$sum: { $cond: [{ $eq: ['$isCaptured', true] }, 1, 0] }, // Updated 'isCaptured'
					},
					uncaptured: {
						$sum: { $cond: [{ $eq: ['$isCaptured', false] }, 1, 0] },
					},
				},
			},
		]);

		res
			.status(200)
			.json({ success_rate: successRate[0] || { captured: 0, uncaptured: 0 } });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get revenue by coupon category
export const getRevenueByCategory = async (req, res) => {
	try {
		const last30Days = moment().subtract(30, 'days').toDate();

		const revenueByCategory = await Transaction.aggregate([
			{
				$match: {
					isCaptured: true,
					createdAt: { $gte: last30Days },
				},
			},
			{
				$lookup: {
					from: 'couponcategories',
					localField: 'couponCategoryId',
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
					revenue: { $sum: '$amount' },
				},
			},
			{
				$sort: { revenue: -1 },
			},
		]);

		res.status(200).json({ revenue_by_category: revenueByCategory });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get total revenue
export const getTotalRevenue = async (req, res) => {
	try {
		const totalRevenue = await Transaction.aggregate([
			{
				$match: { isCaptured: true }, // Updated 'isCaptured'
			},
			{
				$group: {
					_id: null,
					total_revenue: { $sum: '$amount' },
				},
			},
		]);

		res
			.status(200)
			.json({ total_revenue: totalRevenue[0]?.total_revenue || 0 });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


