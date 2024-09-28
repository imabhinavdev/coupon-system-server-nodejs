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
			const couponCategory = await CouponCategory.findByPk(id);
			return res.status(200).json({
				message: 'Coupon category fetched successfully',
				coupon_category: couponCategory,
			});
		}

		if (isActive === 'true') {
			couponCategories = await CouponCategory.findAll({
				where: { is_active: true },
			});
		} else if (isActive === 'false') {
			couponCategories = await CouponCategory.findAll({
				where: { is_active: false },
			});
		} else {
			couponCategories = await CouponCategory.findAll();
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

		if (!id) {
			return res.status(400).json({ message: 'id is required' });
		}

		const couponCategory = await CouponCategory.findByPk(id);
		if (!couponCategory) {
			return res.status(404).json({ message: 'Coupon category not found' });
		}

		await couponCategory.update(req.body);
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

		const couponCategory = await CouponCategory.findByPk(id);
		if (!couponCategory) {
			return res.status(404).json({ message: 'Coupon category not found' });
		}

		await couponCategory.destroy();
		res.status(200).json({ message: 'Coupon category deleted successfully' });
	} catch (err) {
		res.status(500).json({
			message: 'Error deleting coupon category',
			error: err.message,
		});
	}
};
