import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { AppDataSource, testConnection } from "./config/database";
import UserRouter from "./routes/UserRouter";
import AuthRouter from "./routes/AuthRouter";
import TeamRouter from "./routes/TeamRouter";

dotenv.config();
//création de l'app express
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', UserRouter);
app.use('/api/auth', AuthRouter);
app.use('/api/teams', TeamRouter);

// route de test
app.get('/', (_req: Request, res: Response) => {
  res.send('✅ Time Manager API is running');
});

// Démarrage du serveur (évite d'écouter en mode test)
if (process.env.NODE_ENV !== "test") {
  const PORT = Number(process.env.BACKEND_PORT) || 5001;
  (async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log("✅ TypeORM DataSource initialisé");
      }
      await testConnection();

      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error("❌ Erreur au démarrage du serveur :", err);
      process.exit(1);
    }
  })();
}

export default app;

