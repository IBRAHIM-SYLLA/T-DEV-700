import dotenv from "dotenv";
import path from "path";
import { AppDataSource, testConnection } from "./config/database";
import app from "./index";

const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

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
