import PermissionModel from '../models/permission.model.js';

export const createPermission = async (req, res) => {
	const { name, value } = req.body;
	if (!name || !value) {
		return res
			.status(400)
			.json({ message: 'Please fill name and value fields' });
	}
	try {
		const permission = await PermissionModel.create({ name, value });
		return res.status(201).json({ permission });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const getPermissions = async (req, res) => {
	const isActive = req.query.isActive === 'true';

	if (isActive) {
		try {
			const permissions = await PermissionModel.find({ isActive });
			return res.status(200).json({ permissions });
		} catch (error) {
			return res.status(500).json({ message: error.message });
		}
	}
	try {
		const permissions = await PermissionModel.find();
		return res.status(200).json({ permissions });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const deletePermission = async (req, res) => {
	const { id } = req.params;
	try {
		const permission = await PermissionModel.findByIdAndDelete(id);
		if (!permission) {
			return res.status(404).json({ message: 'Permission not found' });
		}
		return res.status(200).json({ message: 'Permission deleted successfully' });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};
