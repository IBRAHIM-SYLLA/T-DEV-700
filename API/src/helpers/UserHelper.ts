import { find } from "lodash";
import { UserModel } from "../models/user.model";
import { UserRepository } from "../repository/UserRepository";

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
        user.team_id = row.team_id;
        user.role = row.role;
        return user;
    }

    userModelByReqBody(req: any, hashedPassword: string): UserModel {
        const user = new UserModel();
        user.first_name = req.body.first_name;
        user.last_name = req.body.last_name;
        user.email = req.body.email;
        user.phone_number = req.body.phone_number;
        user.password = hashedPassword;
        user.team_id = req.body.team_id;
        user.role = req.body.role;
        return user;
    }

    // getUserForTeam(team_id: number): UserModel[] {
    //     let repo: UserRepository = new UserRepository();
    //     const users = await repo.getAllUsers();
    //     let usersForTeams: UserModel[] = [];
    //     let result: UserModel[] = users.find() ?? new UserModel();
    //     if (result) {
    //         usersForTeams = result;

    //     }
    //     return usersForTeams;
    // }
}