import { UserModel } from "../models/user.model";

export class UserHelper {

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
}