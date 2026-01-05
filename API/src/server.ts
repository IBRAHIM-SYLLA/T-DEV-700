import dotenv from "dotenv";
import cors from 'cors';
import path from "path";
import { testConnection } from './config/database';
import UserRouter from './routes/UserRouter';
import AuthRouter from './routes/AuthRouter';
import express from 'express';
import 'reflect-metadata'; // ⚠️ IMPORTANT pour TypeORM

dotenv.config();
//création de l'app express
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', UserRouter);
app.use('/api/auth', AuthRouter);

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });


if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.BACKEND_PORT || 5001;
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await testConnection();
  });
}

// route de test
app.get('/', (req, res) => {
  res.send('✅ Time Manager API is running');
});

// Démarrage du serveur
const PORT = process.env.BACKEND_PORT || 5001;
app.listen(process.env.BACKEND_PORT || 5001, async () => {
  console.log(`🚀 Server running on port ${process.env.BACKEND_PORT || 5001}, http://localhost:${PORT}`);
  await testConnection();
});

export default app;

