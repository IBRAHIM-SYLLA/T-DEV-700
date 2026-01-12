import dotenv from "dotenv";
import path from "path";
import { AppDataSource } from './config/database';
import app from "./index";

dotenv.config();
if (process.env.NODE_ENV !== "test") {
  console.log("SERVER.TS EXECUTÉ");

  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });
  // Démarrage du serveur
  const PORT = Number(process.env.API_PORT ?? 5001);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  console.log("SYNC =", AppDataSource.options.synchronize);
  console.log("ENTITIES =", AppDataSource.options.entities);
  AppDataSource.initialize()
    .then(async () => {
      console.log("DataSource initialisé");
    })
    .catch((err) => {
      console.error("Erreur TypeORM :", err);
      console.error("Le serveur reste actif mais la DB n'est pas connectée");
    });
}