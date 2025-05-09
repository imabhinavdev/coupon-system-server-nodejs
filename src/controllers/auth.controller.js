import User from '../models/user.model.js';

export const signUp = async (req, res) => {
	const { name, email, password, enrollment, phone } = await req.body;

	const requiredFields = ['name', 'email', 'password', 'phone'];

	for (const field of requiredFields) {
		if (!req.body[field]) {
			return res.status(400).json({
				error: `${field} is required`,
			});
		}
	}

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				error: 'Email already exists',
			});
		}

		const user = await User.create({
			name,
			email,
			password,
			phone,
		});

		if (enrollment) {
			user.enrollment = enrollment;
		}

		await user.save();

		const otpSend = await user.sendOTP();
		if (!otpSend) {
			return res.status(500).json({
				error: 'Error sending OTP',
			});
		}

		res.status(200).json({
			message: 'OTP sent to email',
		});

		// const token = user.generateToken();

		// res.cookie('token', token, {
		// 	maxAge: 3600 * 1000, // 1 hour
		// 	httpOnly: true,
		// 	sameSite: 'lax',
		// });

		// res.status(200).json({
		// 	message: 'User created successfully',
		// 	user: user.toJSON(),
		// });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: 'Error creating user',
			message: error.message,
		});
	}
};

export const verifyOTP = async (req, res) => {
	const { email, otp } = req.body;

	if (!email || !otp) {
		return res.status(400).json({
			error: 'All fields are required',
		});
	}

	try {
		const user = await User.findOne({
			email,
		});

		if (!user) {
			return res.status(400).json({
				error: 'Invalid email',
			});
		}

		const isVerified = await user.compareOTPForVerification(otp);
		if (!isVerified) {
			return res.status(400).json({
				message: 'Invalid OTP',
			});
		}

		const token = user.generateToken();
		res.cookie('token', token, {
			maxAge: 3600 * 1000, // 1 hour
			httpOnly: true,
			sameSite: 'lax',
		});

		res.status(200).json({
			message: 'OTP verified',
			user: user.toJSON(),
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Error verifying OTP',
			message: error.message,
		});
	}
};

// Login Function
export const login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			error: 'All fields are required',
		});
	}

	try {
		const user = await User.findOne({ email }).populate({
			path: 'role',
			populate: { path: 'permissions', select: 'name value' },
		});

		if (!user) {
			return res.status(400).json({
				error: 'Invalid email',
			});
		}

		user.permissions = user.role.permissions.map(
			(permission) => permission.value,
		);

		if (!user.isActive) {
			return res.status(400).json({
				error: 'Account is deactivated',
			});
		}

		if (!user.isVerified) {
			user.sendOTP();
			return res.status(400).json({
				error: 'Account not verified',
				message: 'OTP sent to email',
			});
		}

		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(400).json({
				error: 'Invalid password',
			});
		}

		// Remove password field before sending the response
		user.password = undefined;

		const token = await user.generateToken();

		const options = {
			expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production' ? true : false,
		};

		res.cookie('token', token, options);

		// Exclude role permissions in the response, but include role name
		const { ...userWithoutRole } = user._doc;

		res.status(200).json({
			message: 'Login successful',
			user: {
				...userWithoutRole,
				permissions: user.permissions,
				role: {
					name: user.role.name, // Include role name
				},
			},
			token,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error logging in',
			error: error.message,
		});
	}
};

export const whoAmI = async (req, res) => {
	const userId = req.userId;
	const user = await User.findById(userId).populate({
		path: 'role',
		populate: { path: 'permissions', select: 'name value' },
	});

	if (!user) {
		return res.status(400).json({
			error: 'Invalid email',
		});
	}

	user.permissions = user.role.permissions.map(
		(permission) => permission.value,
	);

	if (!user.isActive) {
		return res.status(400).json({
			error: 'Account is deactivated',
		});
	}

	if (!user.isVerified) {
		return res.status(400).json({ message: 'Account not verified' });
	}

	user.password = undefined;

	res.status(200).json({
		user: {
			...user.toJSON(),
			permissions: user.permissions,
			role: {
				name: user.role.name,
			},
		},
	});
};

export const logout = (req, res) => {
	res.cookie('token', '', {
		maxAge: -1,
		httpOnly: true,
		sameSite: 'lax',
	});

	res.status(200).json({
		message: 'Logged out successfully',
	});
};

export const ForgotOTPEmail = async (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({
			error: 'Email is required',
		});
	}

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({
				error: 'Invalid email',
			});
		}

		const otpSend = await user.sendOTP();
		if (!otpSend) {
			return res.status(500).json({
				error: 'Error sending OTP',
			});
		}

		res.status(200).json({
			message: 'OTP sent to email',
		});
	} catch (error) {
		return res.status(500).json({
			message: 'Error sending OTP',
			error: error.message,
		});
	}
};

export const ResetPassword = async (req, res) => {
	const { email, otp, password } = req.body;

	if (!email || !otp || !password) {
		return res.status(400).json({
			error: 'All fields are required',
		});
	}

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({
				error: 'Invalid email',
			});
		}

		const isVerified = await user.compareOTP(otp);
		if (!isVerified) {
			return res.status(400).json({
				error: 'Invalid OTP',
			});
		}

		user.password = password;
		await user.save();

		res.status(200).json({
			message: 'Password reset successfully',
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: 'Error resetting password',
		});
	}
};
