import Transaction from '../models/transactions.model.js';
import moment from 'moment';
import xlsx from 'xlsx';
import Coupon from '../models/coupon.model.js';
import User from '../models/user.model.js';
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
					status: 'success',
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
						$sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }, // Updated 'status'
					},
					uncaptured: {
						$sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
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
					status: 'success',
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
				$match: { status: 'success' }, // Updated 'status'
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

export const generateReport = async (req, res) => {
	try {
		// Fetch Coupon Data
		const coupons = await Coupon.find()
			.populate('userId', 'name email')
			.populate('couponCategoryId', 'name')
			.populate('scannedBy', 'name email')
			.populate('transactionId', 'orderId amount status');
		console.log(coupons);

		const couponData = coupons.map((coupon) => ({
			'Coupon ID': coupon._id ? coupon._id.toString() : 'N/A',
			'User Name': coupon.userId?.name || 'N/A',
			'User Email': coupon.userId?.email || 'N/A',
			'Coupon Category': coupon.couponCategoryId?.name || 'N/A',
			'Is Used': coupon.isUsed,
			'Scanned By': coupon.scannedBy?.name || 'N/A',
			Day: coupon.day,
			'Number of Persons': coupon.noOfPerson,
			'Transaction ID': coupon.transactionId?.orderId || 'N/A',
			'Transaction Amount': coupon.transactionId?.amount || 'N/A',
			'Transaction Status': coupon.transactionId?.status || 'N/A',
			'Created At': coupon.createdAt,
			'Updated At': coupon.updatedAt,
		}));

		// Fetch Transaction Data
		const transactions = await Transaction.find().populate(
			'userId',
			'name email',
		);

		const transactionData = transactions.map((transaction) => ({
			'Transaction ID': transaction._id.toString(),
			'User Name': transaction.userId?.name || 'N/A',
			'User Email': transaction.userId?.email || 'N/A',
			Amount: transaction.amount,
			'Payment ID': transaction.paymentId || 'N/A',
			'Order ID': transaction.orderId,
			Status: transaction.status,
			'Payment Mode': transaction.paymentMode,
			'Created At': transaction.createdAt,
			'Updated At': transaction.updatedAt,
		}));

		// Fetch Student Data with Aggregation
		// Fetch Student Data with Aggregation
		const students = await User.aggregate([
			{ $match: { role: 'user' } },
			{
				$lookup: {
					from: 'transactions',
					localField: '_id',
					foreignField: 'userId',
					as: 'transactions',
				},
			},
			{
				$project: {
					'Student ID': { $toString: '$_id' }, // Ensure it's a string
					'Student Name': '$name',
					'Student Email': '$email',
					'Enrollment Number': '$enrollment',
					'Number of Transactions': { $size: '$transactions' },
					'Number of Failed Transactions': {
						$size: {
							$filter: {
								input: '$transactions',
								as: 'transaction',
								cond: { $eq: ['$$transaction.status', 'failed'] },
							},
						},
					},
					'Total Amount Generated': {
						$sum: {
							$map: {
								input: {
									$filter: {
										input: '$transactions',
										as: 'transaction',
										cond: { $eq: ['$$transaction.status', 'success'] },
									},
								},
								as: 'transaction',
								in: '$$transaction.amount', // Extract the amount
							},
						},
					},
					Phone: '$phone',
					'Created At': '$createdAt',
					'Updated At': '$updatedAt',
				},
			},
		]);

		const studentData = students.map((student) => ({
			'Student ID': student['Student ID'],
			'Student Name': student['Student Name'],
			'Student Email': student['Student Email'],
			'Enrollment Number': student['Enrollment Number'],
			'Number of Transactions': student['Number of Transactions'],
			'Number of Failed Transactions': student['Number of Failed Transactions'],
			'Total Amount Generated': student['Total Amount Generated'],
			Phone: student['Phone'],
			'Created At': student['Created At'],
			'Updated At': student['Updated At'],
		}));

		const faculty = await User.aggregate([
			{ $match: { role: 'faculty' } },
			{
				$lookup: {
					from: 'transactions',
					localField: '_id',
					foreignField: 'scannedBy', // Assuming scannedBy is the faculty field in Transaction
					as: 'transactions',
				},
			},
			{
				$project: {
					'Faculty ID': { $toString: '$_id' },
					'Faculty Name': '$name',
					'Faculty Email': '$email',
					'Number of Transactions': { $size: '$transactions' },
					'Number of Failed Transactions': {
						$size: {
							$filter: {
								input: '$transactions',
								as: 'transaction',
								cond: { $eq: ['$$transaction.status', 'failed'] },
							},
						},
					},
					'Total Amount Generated': {
						$sum: {
							$filter: {
								input: '$transactions',
								as: 'transaction',
								cond: { $eq: ['$$transaction.status', 'success'] },
							},
						},
					},
					Role: '$role',
					'Created At': '$createdAt',
					'Updated At': '$updatedAt',
				},
			},
		]);

		const facultyData = faculty.map((facultyMember) => ({
			'Faculty ID': facultyMember['Faculty ID'],
			'Faculty Name': facultyMember['Faculty Name'],
			'Faculty Email': facultyMember['Faculty Email'],
			'Number of Transactions': facultyMember['Number of Transactions'],
			'Number of Failed Transactions':
				facultyMember['Number of Failed Transactions'],
			'Total Amount Generated': facultyMember['Total Amount Generated'],
			Role: facultyMember['Role'],
			'Created At': facultyMember['Created At'],
			'Updated At': facultyMember['Updated At'],
		}));

		// Create a new workbook
		const workbook = xlsx.utils.book_new();

		// Create worksheets
		const couponWorksheet = xlsx.utils.json_to_sheet(couponData);
		const transactionWorksheet = xlsx.utils.json_to_sheet(transactionData);
		const studentWorksheet = xlsx.utils.json_to_sheet(studentData);
		const facultyWorksheet = xlsx.utils.json_to_sheet(facultyData);

		// Append sheets to the workbook
		xlsx.utils.book_append_sheet(workbook, couponWorksheet, 'Coupons');
		xlsx.utils.book_append_sheet(
			workbook,
			transactionWorksheet,
			'Transactions',
		);
		xlsx.utils.book_append_sheet(workbook, studentWorksheet, 'Students');
		xlsx.utils.book_append_sheet(workbook, facultyWorksheet, 'Faculty');

		// Generate buffer
		const excelBuffer = xlsx.write(workbook, {
			bookType: 'xlsx',
			type: 'buffer',
		});

		// Set headers and send file
		res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		res.send(excelBuffer);
	} catch (error) {
		console.error(error);
		res.status(500).send('Error generating report');
	}
};
