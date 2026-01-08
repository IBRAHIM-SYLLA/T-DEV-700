import { JwtUser } from "./jwt-user";

declare global {
    namespace Express {
        interface Request {
            user?: JwtUser;
        }
    }
}

export { };
