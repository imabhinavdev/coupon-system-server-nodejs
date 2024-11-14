import RoleModel from '../models/roles.model.js';

export const createRole = async (req, res) => {
	const { name, permissions } = req.body;
	if (!name) {
		return res
			.status(400)
			.json({ message: 'Please fill name and permission field' });
	}
	try {
		const role = await RoleModel.create({ name, permissions });
		return res.status(201).json({ role });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const getRoles = async (req, res) => {
	const isActive = req.query.isActive === 'true';

	if (isActive) {
		try {
			const roles = await RoleModel.find({ isActive }).populate(
				'permissions',
				'name value isActive',
			);
			return res.status(200).json({ roles });
		} catch (error) {
			return res.status(500).json({ message: error.message });
		}
	}
	try {
		const roles = await RoleModel.find().populate(
			'permissions',
			'name value isActive',
		);
		return res.status(200).json({ roles });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const deleteRole = async (req, res) => {
	const { id } = req.params;
	try {
		const role = await RoleModel.findByIdAndDelete(id);
		if (!role) {
			return res.status(404).json({ message: 'Role not found' });
		}
		return res.status(200).json({ message: 'Role deleted successfully' });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const updateRole = async (req, res) => {
	const { id } = req.params;
	const { name, permissions, isActive } = req.body;
	try {
		const role = await RoleModel.findByIdAndUpdate(
			id,
			{ name, permissions, isActive },
			{ new: true },
		);
		if (!role) {
			return res.status(404).json({ message: 'Role not found' });
		}
		return res.status(200).json({ role });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const getRoleById = async (req, res) => {
	const { id } = req.params;
	try {
		const role = await RoleModel.findById(id).populate(
			'permissions',
			'name value isActive',
		);
		if (!role) {
			return res.status(404).json({ message: 'Role not found' });
		}
		return res.status(200).json({ role });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};
