export class UserLight {
    user_id!: number;
    first_name!: string;
    last_name!: string;
    email!: string;
    phone_number!: string;
    role!: "super_admin" | "manager" | "employee";
    team_id!: number | null;
}