export interface JwtUser {
    user_id: number;
    email: string;
    role: "super_admin" | "manager" | "employee" | "rh";
}
