import Transaction from '../models/transactions.model.js';
import moment from 'moment';

export const getTransactions = async (req, res) => {
	const userId = req.query.user_id;

	try {
		const transactions = userId
			? await Transaction.find({ userId: userId })
					.populate('couponCategoryId')
					.sort({ createdAt: -1 })
			: await Transaction.find({
					created_at: { $gte: moment().subtract(30, 'days').toDate() },
				})
					.populate('couponCategoryId')
					.sort({ created_at: -1 });

		res.status(200).json(transactions );
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: error.message });
	}
};

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
					created_at: {
						$gte: new Date(from),
						$lte: new Date(to),
					},
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
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

export const getRevenueStats = async (req, res) => {
	let { from, to } = req.query;
	if (!from || !to) {
		to = moment().format('YYYY-MM-DD');
		from = moment().subtract(30, 'days').format('YYYY-MM-DD');
	}

	try {
		const revenue = await Transaction.aggregate([
			{
				$match: {
					is_captured: true,
					created_at: {
						$gte: new Date(from),
						$lte: new Date(to),
					},
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
					revenue: { $sum: '$amount' },
				},
			},
			{
				$sort: { _id: 1 },
			},
		]);

		const daysMap = {};
		revenue.forEach((r) => {
			daysMap[r._id] = r.revenue;
		});

		const result = [];
		for (
			let d = moment().subtract(30, 'days');
			!d.isAfter(moment());
			d.add(1, 'days')
		) {
			const dateStr = d.format('YYYY-MM-DD');
			result.push({ date: dateStr, revenue: daysMap[dateStr] || 0 });
		}

		res.status(200).json({ revenue: result });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getTransactionSuccessRate = async (req, res) => {
	try {
		const successRate = await Transaction.aggregate([
			{
				$group: {
					_id: null,
					captured: {
						$sum: { $cond: [{ $eq: ['$is_captured', true] }, 1, 0] },
					},
					uncaptured: {
						$sum: { $cond: [{ $eq: ['$is_captured', false] }, 1, 0] },
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

export const getRevenueByCategory = async (req, res) => {
	try {
		const last30Days = moment().subtract(30, 'days').toDate();
		const revenueByCategory = await Transaction.aggregate([
			{
				$match: {
					is_captured: true,
					created_at: { $gte: last30Days },
				},
			},
			{
				$lookup: {
					from: 'coupon_categories',
					localField: 'coupon_category_id',
					foreignField: 'id',
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

export const getTotalRevenue = async (req, res) => {
	try {
		const totalRevenue = await Transaction.aggregate([
			{
				$match: { is_captured: true },
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
