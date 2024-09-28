import { config as configure } from "dotenv";

configure();

export const config = {
  port: process.env.PORT,
  dbUrl: process.env.MONGODB_URI,
};
