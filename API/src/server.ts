import express from 'express';
import dotenv from "dotenv";
import path from "path";
import { testConnection } from './config/database';
import pool from './config/database';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

//création de l'app express
const app = express();
app.use(express.json());

//test de la db
testConnection();
// route de test
app.get('/', (req, res) => {
  res.send('✅ Time Manager API is running');
});

// Démarrage du serveur
const PORT = process.env.BACKEND_PORT || 5001;

app.listen(process.env.BACKEND_PORT || 5001, async () => {
  console.log(`Server running on port ${process.env.BACKEND_PORT || 5001}`);
  await testConnection();
<<<<<<< HEAD
});  

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.get('/test-db', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT NOW() AS time');
    conn.release();
    res.json({ success: true, time: rows[0].time });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection failed', error: err });
  }
=======
>>>>>>> 91feab1 (feat(crud-users): get des users en place)
});