import mariadb from "mariadb";
import dotenv from 'dotenv';
import path from "path";
import { DataSource } from "typeorm";
import "reflect-metadata";
import { UserEntity } from "../models/User/UserEntity";
import { TeamEntity } from "../models/Team/TeamEntity";
import { ClockEntity } from "../models/Clock/ClockEntity";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
    ssl: false
});

export const AppDataSource = new DataSource({
    type: "mariadb",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,  
    logging: true,
    entities: [UserEntity, TeamEntity, ClockEntity],
    migrations: ["src/migrations/**/*.ts"],
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
