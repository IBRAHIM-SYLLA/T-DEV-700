import { pool } from '../config/database';
import { UserHelper } from "../helpers/UserHelper";
import { UserModel } from "../models/User/user.model";


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
            const rows = await conn.query(this.userHelper.getReqAllUsers());

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

    /**
     * @name getUserById()
     * @memberof UserRepository
     * @param userId 
     * @description Retourne un user par son id
     * @returns  Promise<UserModel>
     */
    async getUserById(userId: number): Promise<UserModel> {
        let conn;
        try {
            conn = await pool.getConnection();
            const row = await conn.query(this.userHelper.getReqUserById(userId));
            // Si ton driver MariaDB retourne une première ligne meta, supprime-la :
            if (Array.isArray(row) && row.length > 0 && typeof row[0] === "object") {
                return this.userHelper.userModelBySqlRow(row[0]);
            }
            else {
                return row;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs :", error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * @name createUser()
     * @memberof UserRepository
     * @param user
     * @description Creer un utilisateur et le renvoie
     * @returns  Promise<UserModel>
     */
    async createUser(user: UserModel): Promise<UserModel> {
        const params = [
            user.first_name,
            user.last_name,
            user.email,
            user.phone_number,
            user.password,
            user.team_id,
            user.role,
        ];
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query(this.userHelper.getReqInsertUser(), params);
            return this.userHelper.userModelBySqlRow(result[0]);
        } catch (err) {
            console.error('Erreur insert user:', err);
            throw err;
        }
    }

    /**
     * @name updateUser()
     * @memberof UserRepository
     * @param user
     * @description Creer un utilisateur et le renvoie
     * @returns  Promise<UserModel>
     */
    async updateUser(user: UserModel, userId: number): Promise<UserModel> {
        const checkUser: UserModel = await this.getUserById(userId);
        if (checkUser.user_id > 0) {
            const params = [
                user.first_name,
                user.last_name,
                user.email,
                user.phone_number,
                user.team_id,
                user.role,
            ];
            let conn;
            try {
                conn = await pool.getConnection();
                await conn.query(this.userHelper.getReqUpdateUser(checkUser.user_id), params);
                user.user_id = checkUser.user_id;
                return user;
            } catch (err) {
                console.error('Erreur insert user:', err);
                throw err;
            }
        }
        else {
            console.error('Erreur utilisateur inexistant');
            return new UserModel();
        }
    }

    /**
     * @name deleteUser()
     * @memberof UserRepository
     * @param user
     * @description Supprimer un utilisateur
     */
    async deleteUser(userId: number) {
        try {
            const sql = `DELETE FROM users WHERE user_id = ?`;
            const result = await pool.execute(sql, [userId]);

            const affectedRows = (result as any).affectedRows;

            if (affectedRows === 0) {
                return null;
            }

            console.log(` Utilisateur ${userId} supprimé (${affectedRows} ligne)`);
            return true;
        } catch (err) {
            console.error(' Erreur deleteUser :', err);
            throw err;
        }
    }

    /**
     * @name findByEmail()
     * @param email
     * @description Recherche un utilisateur par email
     */
    async findByEmail(email: string): Promise<UserModel | null> {
        let conn;
        try {
            conn = await pool.getConnection();
            const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
            const rows = await conn.query(sql, [email]);
            if (Array.isArray(rows) && rows.length > 0 && typeof rows[0] === "object") {
                return this.userHelper.userModelBySqlRow(rows[0]);
            }
            return null;
        } catch (err) {
            console.error("Erreur lors de la recherche d'utilisateur par email :", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * @name checkIfExists()
     * @param email
     * @description Vérifie si un utilisateur existe déjà
     */
    async checkIfExists(email: string): Promise<boolean> {
        const user = await this.findByEmail(email);
        return !!user;
    }
}