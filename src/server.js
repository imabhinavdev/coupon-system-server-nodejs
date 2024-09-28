import express from 'express';
import { configDotenv } from 'dotenv';
import { DbConnection } from './db/connection.js';

configDotenv();
const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

DbConnection();

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
	console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
