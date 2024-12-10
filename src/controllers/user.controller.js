import User from '../models/user.model.js';
import Transactions from '../models/transactions.model.js';
import Coupon from '../models/coupon.model.js';
export const createUser = async (req, res) => {
	const { name, email, password, enrollment, phone, role, isVerified } =
		req.body;

	if (!name || !email || !password || !phone || !role) {
		return res
			.status(400)
			.json({ error: 'Required Fields: name, email, password, phone,role' });
	}

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ error: 'Email already exists' });
		}

		const user = new User({
			name,
			email,
			password,
			enrollment,
			phone,
			role,
			isVerified: isVerified === 'true',
		});

		await user.save();
		user.password = '';

		res.status(200).json({ message: 'User created successfully', user });
	} catch (err) {
		res
			.status(500)
			.json({ message: 'Error creating user', error: err.message });
	}
};

export const updateUser = async (req, res) => {
	const id = req.params.id;
	const { name, email, enrollment, phone, isActive, isVerified, role } =
		req.body;

	if (!name || !email || !phone) {
		return res.status(400).json({ error: 'All fields are required' });
	}

	try {
		const user = await User.findById(id);
		if (!user) {
			return res.status(400).json({ error: 'User not found' });
		}

		user.name = name;
		user.email = email;
		user.enrollment = enrollment;
		user.phone = phone;
		user.isActive = isActive;
		user.isVerified = isVerified;
		user.role = role;
		await user.save();

		res.status(200).json({
			message: 'User updated successfully',
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				isActive: user.isActive,
				isVerified: user.isVerified,
				role: user.role,
			},
		});
	} catch (err) {
		res
			.status(500)
			.json({ message: 'Error updating user', error: err.message });
	}
};

export const deleteUser = async (req, res) => {
	const id = req.params.id;

	try {
		const user = await User.findById(id);
		if (!user) {
			return res.status(400).json({ error: 'User not found' });
		}

		await user.remove();
		res.status(200).json({ message: 'User deleted successfully' });
	} catch (err) {
		res
			.status(500)
			.json({ message: 'Error deleting user', error: err.message });
	}
};

export const getUser = async (req, res) => {
	const id = req.params.id;
	const isStaff = req.query.isStaff;
	const isAdmin = req.query.isAdmin;
	const other_users = req.query.otherUsers;
	const search = req.query.search;

	try {
		if (id) {
			const user = await User.findById(id).populate('role');
			if (!user) {
				return res.status(400).json({ error: 'User not found' });
			}
			user.password = '';
			return res.status(200).json({ user });
		}

		let users;
		if (other_users) {
			users = await User.find({
				role: { $nin: ['admin', 'staff'] },
			});
		} else if (isStaff) {
			users = await User.find({ role: 'staff' });
		} else if (isAdmin) {
			users = await User.find({ role: 'admin' });
		} else if (search) {
			users = await User.find({
				$or: [
					{ name: { $regex: search, $options: 'i' } },
					{ email: { $regex: search, $options: 'i' } },
					{ enrollment: { $regex: search, $options: 'i' } },
				],
			}).select('name email');
		} else {
			users = await User.find({}).populate('role', 'name');
		}

		res.status(200).json({ users });
	} catch (err) {
		res
			.status(500)
			.json({ messgae: 'Error retrieving users', error: err.message });
	}
};

export const getUserActiveStatus = async (req, res) => {
	try {
		const activeCount = await User.countDocuments({ isActive: true });
		const inactiveCount = await User.countDocuments({ isActive: false });

		res.status(200).json({
			active_status: {
				active: activeCount,
				inactive: inactiveCount,
			},
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: 'Error retrieving active status' });
	}
};

export const getNewUsersStats = async (req, res) => {
	const days = parseInt(req.query.days) || 7;

	try {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const newUsersCount = await User.countDocuments({
			createdAt: { $gte: startDate },
		});

		res.status(200).json({ new_users: newUsersCount, days });
	} catch (err) {
		res.status(500).json({
			message: 'Error retrieving new users statistics',
			error: err.message,
		});
	}
};
export const getUserAllDetails = async (req, res) => {
	const id = req.params.id;

	try {
		const user = await User.findById(id).populate('role');

		if (!user) {
			return res.status(400).json({ error: 'User not found' });
		}

		user.password = '';

		const transactions = await Transactions.find({ userId: id })
			.populate('couponCategoryId', 'name')
			.sort({
				createdAt: -1,
			});

		const orders = await Coupon.find({ userId: id })
			.populate('scannedBy', 'name email')
			.populate('couponCategoryId', 'name')
			.sort({ createdAt: -1 });

		res.status(200).json({ user, transactions, orders });
	} catch (err) {
		res
			.status(500)
			.json({ message: 'Error retrieving user details', error: err.message });
	}
};
