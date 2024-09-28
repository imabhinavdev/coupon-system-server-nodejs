import User from '../models/user.model.js';

export const createUser = async (req, res) => {
	const {
		name,
		email,
		password,
		enrollment,
		phone,
		is_active,
		is_admin,
		is_verified,
		is_staff,
	} = req.body;

	if (!name || !email || !password || !enrollment || !phone) {
		return res.status(400).json({ error: 'All fields are required' });
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
			isActive: is_active === 'true',
			isStaff: is_staff === 'true',
			isAdmin: is_admin === 'true',
			isVerified: is_verified === 'true',
		});

		await user.save();
		user.password = '';

		res.status(200).json({ message: 'User created successfully', user });
	} catch (err) {
		res.status(500).json({ error: 'Error creating user' });
	}
};

export const updateUser = async (req, res) => {
	const id = req.params.id;
	const { name, email, enrollment, phone, isActive, isAdmin, isVerified } =
		req.body;

	if (!name || !email || !enrollment || !phone) {
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

		if (isActive !== undefined) user.isActive = isActive === 'true';
		if (isAdmin !== undefined) user.isAdmin = isAdmin === 'true';
		if (isVerified !== undefined) user.isVerified = isVerified === 'true';

		await user.save();

		res.status(200).json({
			message: 'User updated successfully',
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				isActive: user.isActive,
				isAdmin: user.isAdmin,
				isVerified: user.isVerified,
			},
		});
	} catch (err) {
		res.status(500).json({ error: 'Error updating user' });
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
		res.status(500).json({ error: 'Error deleting user' });
	}
};

export const getUser = async (req, res) => {
	const id = req.params.id;
	const is_staff = req.query.is_staff;
	const is_admin = req.query.is_admin;
	const other_users = req.query.other_users;

	try {
		if (id) {
			const user = await User.findById(id);
			if (!user) {
				return res.status(400).json({ error: 'User not found' });
			}
			user.password = '';
			return res.status(200).json({ user });
		}

		let users;
		if (other_users) {
			users = await User.find({ isStaff: false, isAdmin: false });
		} else if (is_staff) {
			users = await User.find({ isStaff: true, isAdmin: false });
		} else if (is_admin) {
			users = await User.find({ isAdmin: true, isStaff: false });
		} else {
			users = await User.find({});
		}

		res.status(200).json({ users });
	} catch (err) {
		res.status(500).json({ error: 'Error retrieving users' });
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
		res.status(500).json({ error: 'Error retrieving new users statistics' });
	}
};
