import express from 'express';
import { configDotenv } from 'dotenv';
import { DbConnection } from './db/connection.js';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
configDotenv();

const app = express();
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: '*',
		credentials: true,
	}),
);
app.use(cookieParser());
DbConnection();

app.get('/', (req, res) => {
	res.send('Hello World!');
});

// Importing routes
import userRoutes from './routes/user.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import transactionRoutes from './routes/transactions.routes.js';
import authRoutes from './routes/auth.routes.js';
import couponCategoryRoutes from './routes/coupon-category.routes.js';
import contactRoutes from './routes/contact.routes.js';
// Using routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/coupon', couponRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/coupon-category', couponCategoryRoutes);
app.use('/api/v1/contact', contactRoutes);

// app.listen(process.env.PORT, () => {
// 	console.log(`Server is running on http://localhost:${process.env.PORT}`);
// });

export default (req, res) => {
	app(req, res);
};
