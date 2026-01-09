import dotenv from "dotenv";
import path from "path";
import { AppDataSource, testConnection } from './config/database';
import app from "./index";

dotenv.config();
if (process.env.NODE_ENV !== "test") {
  console.log("🔥 SERVER.TS EXECUTÉ");

  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });
  // Démarrage du serveur
  const PORT = process.env.BACKEND_PORT || 5001;

  // ✅ Démarrer le serveur AVANT l'initialisation de la DB
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });


  AppDataSource.initialize()
    .then(async () => {
      console.log("✅ DataSource initialisé");
      // app.listen(process.env.BACKEND_PORT || 5001, async () => {
      //   console.log(`🚀 Server running on port ${process.env.BACKEND_PORT || 5001}, http://localhost:${PORT}`);
      await testConnection();
      // });
    })
    .catch((err) => {
      console.error("❌ Erreur TypeORM :", err);
      console.error("⚠️ Le serveur reste actif mais la DB n'est pas connectée");
    });
}