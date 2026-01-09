export interface JwtUser {
    user_id: number;
    email: string;
    role: "admin" | "manager" | "employee" | "rh";
}
