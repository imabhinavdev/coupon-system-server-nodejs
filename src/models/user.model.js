import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../config/configurations.js';
import jwt from 'jsonwebtoken';
const userSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
	},
	enrollment: {
		type: String,
		trim: true,
	},
	phone: {
		type: String,
		trim: true,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
	isVerified: {
		type: Boolean,
		default: true,
	},
	isStaff: {
		type: Boolean,
		default: false,
	},
	forgotOTP: {
		type: String,
		default: null,
	},
	forgotOTPExpiry: {
		type: Date,
		default: null,
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

userSchema.pre('save', function (next) {
	this.updatedAt = Date.now();
	next();
});

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

userSchema.methods.toJSON = function () {
	const user = this.toObject();
	delete user.password;
	return user;
};

userSchema.methods.comparePassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateForgotOTP = async function () {
	this.forgotOTP = Math.floor(100000 + Math.random() * 900000).toString();
	this.forgotOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
	await this.save();
	return this.forgotOTP;
};

userSchema.methods.clearForgotOTP = async function () {
	this.forgotOTP = null;
	this.forgotOTPExpiry = null;
	await this.save();
};

userSchema.methods.verifyForgotOTP = function (otp) {
	return otp === this.forgotOTP && this.forgotOTPExpiry > Date.now();
};

userSchema.methods.generateToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			isAdmin: this.isAdmin,
			isStaff: this.isStaff,
			isVerified: this.isVerified,
			isActive: this.isActive,
			name: this.name,
			email: this.email,
		},
		config.JWT_SECRET,
		{ expiresIn: '1d' },
	);
};

const User = mongoose.model('User', userSchema);

export default User;
