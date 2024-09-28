import mongoose from 'mongoose';
import { config } from '../config/configurations.js';

export const DbConnection = async () => {
	try {
		await mongoose.connect(config.dbUrl);
		console.log('Database connected successfully');
	} catch (error) {
		console.log('Error while connecting to the database', error);
	}
};
