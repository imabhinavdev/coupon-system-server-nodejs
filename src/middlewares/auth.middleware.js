import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { config } from '../config/configurations.js';
export const authMiddleware = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	jwt.verify(token, config.JWT_SECRET, (err, claims) => {
		if (err) {
			res.clearCookie('token');
			return res.status(401).json({ error: 'Unauthorized' });
		}
		req.user = claims;
		next();
	});
};

export const adminMiddleware = async (req, res, next) => {
	const token = req.cookies.token;
	if (!token) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	jwt.verify(token, config.JWT_SECRET, async (err, claims) => {
		if (err) {
			return res.status(401).json({ error: err.message });
		}
		const id = claims.id;
		const user = await User.findByPk(id);
		if (!user) {
			return res.status(401).json({ error: 'Unauthorized: User not found' });
		}
		if (!user.isAdmin || !user.isActive || !user.isVerified) {
			return res
				.status(401)
				.json({ error: 'Unauthorized: Admin access required' });
		}
		next();
	});
};

export const staffMiddleware = async (req, res, next) => {
	const token = req.cookies.token;
	if (!token) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	jwt.verify(token, config.JWT_SECRET, async (err, claims) => {
		if (err) {
			return res.status(401).json({ error: err.message });
		}
		const id = claims.id;
		const user = await User.findByPk(id);
		if (!user) {
			return res.status(401).json({ error: 'Unauthorized: User not found' });
		}
		if (!user.isStaff || !user.isActive || !user.isVerified) {
			return res
				.status(401)
				.json({ error: 'Unauthorized: Staff access required' });
		}
		next();
	});
};
