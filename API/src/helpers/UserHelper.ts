import { UserModel } from "../models/User/user.model";
import bcrypt from 'bcrypt';
import { UserEntity } from "../models/User/UserEntity";
import { UserLight } from "../models/User/user-light.model";
export class UserHelper {

    getReqAllUsers(): string {
        return `
            SELECT 
                user_id,
                first_name,
                last_name,
                email,
                phone_number,
                password,
                team_id,
                role
            FROM users
            `
            ;
    }

    getReqUserById(userId: number): string {
        return `
            SELECT 
                user_id,
                first_name,
                last_name,
                email,
                phone_number,
                password,
                team_id,
                role
            FROM users
            WHERE user_id = ${userId}
            `
            ;
    }

    getReqInsertUser(): string {
        return `
        INSERT INTO users (
            first_name,
            last_name,
            email,
            phone_number,
            password,
            team_id,
            role
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING user_id, first_name, last_name, email, phone_number, password, team_id, role;
    `;
    }

    getReqUpdateUser(userId: number): string {
        return `
            UPDATE users 
            SET
                first_name = ?,
                last_name = ?,
                email = ?,
                phone_number = ?,
                team_id = ?,
                role = ?
            WHERE user_id = ${userId}
        `;
    }

    userModelBySqlRow(row: any): UserModel {
        const user = new UserModel();
        user.user_id = row.user_id;
        user.first_name = row.first_name;
        user.last_name = row.last_name;
        user.email = row.email;
        user.phone_number = row.phone_number;
        user.password = row.password;
        // user.team_id = row.team_id;
        user.role = row.role;
        return user;
    }

    async userModelByReqBody(req: any): Promise<UserModel> {
        const user = new UserModel();
        user.first_name = req.body.first_name;
        user.last_name = req.body.last_name;
        user.email = req.body.email;
        user.phone_number = req.body.phone_number;
        user.team_id = req.body.team_id;
        user.role = req.body.role;
        user.password = await this.hashString(req.body.password, 10);;
        return user;
    }

    /**
    * Convertit un UserEntity en UserLight (DTO public)
    */
    toUserLight(user: UserEntity): UserLight {
        const light = new UserLight();

        light.user_id = user.user_id;
        light.first_name = user.first_name;
        light.last_name = user.last_name;
        light.email = user.email;
        light.phone_number = user.phone_number;

        light.role = user.role;
        light.team_id = user.team ? user.team.team_id : null;

        return light;
    }

    /**
     * Convertit une liste de UserEntity en UserLight[]
     */
    toUserLightArray(users: UserEntity[]): UserLight[] {
        return users.map(user => this.toUserLight(user));
    }

    async hashString(stringForHash: string, salt: number): Promise<string> {
        return await bcrypt.hash(stringForHash, salt);
    }
}