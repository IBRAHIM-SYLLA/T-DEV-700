import mariadb from "mariadb";
import { config as dotenvConfig } from "dotenv";
import path from "node:path";

dotenvConfig({ path: path.resolve(process.cwd(), ".env") });

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    connectionLimit: 5,
    allowPublicKeyRetrieval: true, // 👈 AJOUTE CETTE LIGNE
    ssl: false
});

export async function testConnection() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("✅ Connecté à la base MariaDB !");
    } catch (err) {
        console.error("❌ Erreur de connexion à MariaDB :", err);
    } finally {
        if (conn) conn.release();
    }
}

export default pool;
