import dotenv from 'dotenv';
import path from "path";
import { DataSource } from "typeorm";
import "reflect-metadata";
import { UserEntity } from "../models/User/UserEntity";
import { TeamEntity } from "../models/Team/TeamEntity";
import { ClockEntity } from "../models/Clock/ClockEntity";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
export const AppDataSource = new DataSource({
    type: "mariadb",
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: true,

    entities: [UserEntity, TeamEntity, ClockEntity],
    migrations: [],
});


// export async function testConnection() {
//     let conn;
//     try {
//         conn = await pool.getConnection();
//         console.log("✅ Connecté à la base MariaDB !");
//     } catch (err) {
//         console.error("❌ Erreur de connexion à MariaDB :", err);
//     } finally {
//         if (conn) conn.release();
//     }
// }
