import * as configDotenv from 'dotenv';
import dotenv from "dotenv";
import path from "node:path";
import app from './index';
import { testConnection } from './config/database';

dotenv.config();
const PORT = process.env.BACKEND_PORT || 5001;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

configDotenv.config({ path: path.resolve(process.cwd(), ".env") });
// app.listen(process.env.PORT || 3000, async () => {
//     console.log('🚀 Serveur prêt sur http://localhost:3000');
//     await testConnection();
// });

app.listen(process.env.BACKEND_PORT || 5001, async () => {
  console.log(`Server running on port ${process.env.BACKEND_PORT || 5001}`);
  await testConnection();  
});