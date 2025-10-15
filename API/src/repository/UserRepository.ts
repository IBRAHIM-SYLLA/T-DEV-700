import pool from "../config/database";
import { UserHelper } from "../helpers/UserHelper";
import { UserModel } from "../models/user.model";


export class UserRepository {

    userHelper: UserHelper = new UserHelper();
    /**
    * Récupère tous les utilisateurs dans la base de données
    * @returns Promise<UserModel[]>
    */
    async getAllUsers(): Promise<UserModel[]> {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query(`
                SELECT 
                    user_id,
                    first_name,
                    last_name,
                    email,
                    phone_number,
                    password,
                    team_id,
                    role
                FROM users;
            `);

            // Si ton driver MariaDB retourne une première ligne meta, supprime-la :
            if (Array.isArray(rows) && rows.length > 0 && typeof rows[0] === "object") {
                return rows.map((row: UserModel) => this.userHelper.userModelBySqlRow(row));
            }

            return [];
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs :", error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }
}