import { RoleEnum } from "../../enums/role-enum";

export interface JwtUser {
    user_id: number;
    email: string;
    role: RoleEnum.SUPER_ADMIN | RoleEnum.RH | RoleEnum.MANAGER | RoleEnum.EMPLOYEE;
}
