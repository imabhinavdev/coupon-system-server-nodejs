import CouponCategory from '../models/coupon-category.model.js';

export const createCouponCategory = async (req, res) => {
	try {
		const { name, price, is_active } = req.body;

		if (!name || !price) {
			return res
				.status(400)
				.json({ message: 'Name and Price are required fields' });
		}

		if (is_active === undefined) {
			return res.status(400).json({ message: 'is_active field is required' });
		}

		const couponCategory = await CouponCategory.create({
			name,
			price,
			is_active,
		});

		res.status(200).json({
			message: 'Coupon category created successfully',
			data: couponCategory,
		});
	} catch (err) {
		res.status(500).json({
			message: 'Could not create coupon category',
			error: err.message,
		});
	}
};

export const getCouponCategory = async (req, res) => {
	try {
		const { id, isActive } = req.query;
		let couponCategories;

		if (id) {
			const couponCategory = await CouponCategory.findById(id);
			return res.status(200).json({
				message: 'Coupon category fetched successfully',
				coupon_category: couponCategory,
			});
		}

		if (isActive === true) {
			couponCategories = await CouponCategory.find({ is_active: true });
		} else if (isActive === false) {
			couponCategories = await CouponCategory.find({ is_active: false });
		} else {
			couponCategories = await CouponCategory.find();
		}

		res.status(200).json({
			message: 'Coupon categories fetched successfully',
			coupon_category: couponCategories,
		});
	} catch (err) {
		res.status(500).json({
			message: 'Error fetching coupon categories',
			error: err.message,
		});
	}
};

export const updateCouponCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, price, isActive } = await req.body;
		const requiredFields = ['name', 'price', 'isActive'];
		requiredFields.forEach((field) => {
			if (req.body[field] === undefined || req.body[field] === '') {
				return res.status(400).json({ message: `${field} is required` });
			}
		});

		if (!id) {
			return res.status(400).json({ message: 'id is required' });
		}

		const couponCategory = await CouponCategory.findByIdAndUpdate(id, {
			name,
			price,
			isActive,
		});
		if (!couponCategory) {
			return res.status(404).json({ message: 'Coupon category not found' });
		}

		res.status(200).json({
			message: 'Coupon category updated successfully',
			coupon_category: couponCategory,
		});
	} catch (err) {
		res.status(500).json({
			message: 'Error updating coupon category',
			error: err.message,
		});
	}
};

export const deleteCouponCategory = async (req, res) => {
	try {
		const { id } = req.params;

		if (!id) {
			return res.status(400).json({ message: 'id is required' });
		}

		const couponCategory = await CouponCategory.findByIdAndDelete(id);
		if (!couponCategory) {
			return res.status(404).json({ message: 'Coupon category not found' });
		}

		res.status(200).json({ message: 'Coupon category deleted successfully' });
	} catch (err) {
		res.status(500).json({
			message: 'Error deleting coupon category',
			error: err.message,
		});
	}
};
