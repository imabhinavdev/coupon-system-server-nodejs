import Footer from '../models/footer.model.js';
import WebsiteName from '../models/website-name.model.js';

export const UpdateFooter = async (req, res) => {
	const { value } = req.body;
	if (!value) {
		return res.status(400).json({
			error: 'Value is required',
		});
	}
	try {
		const footer = await Footer.findOne();
		if (!footer) {
			return res.status(404).json({
				error: 'Footer not found',
			});
		}
		footer.value = value;
		await footer.save();
		res.status(200).json({
			message: 'Footer updated',
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Error updating footer',
		});
	}
};

export const GetFooter = async (req, res) => {
	try {
		const footer = await Footer.findOne();
		if (!footer) {
			return res.status(404).json({
				error: 'Footer not found',
			});
		}
		res.status(200).json({
			footer,
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Error getting footer',
		});
	}
};

export const UpdateWebsiteName = async (req, res) => {
	const { value } = req.body;
	if (!value) {
		return res.status(400).json({
			error: 'Value is required',
		});
	}
	try {
		const websiteName = await WebsiteName.findOne();
		if (!websiteName) {
			return res.status(404).json({
				error: 'Website Name not found',
			});
		}
		websiteName.value = value;
		await websiteName.save();
		res.status(200).json({
			message: 'Website Name updated',
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Error updating website name',
		});
	}
};

export const GetWebsiteName = async (req, res) => {
	try {
		const websiteName = await WebsiteName.findOne();
		if (!websiteName) {
			return res.status(404).json({
				error: 'Website Name not found',
			});
		}
		res.status(200).json({
			websiteName,
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Error getting website name',
		});
	}
};
