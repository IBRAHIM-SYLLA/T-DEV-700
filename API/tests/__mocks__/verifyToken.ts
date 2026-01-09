import { Request, Response, NextFunction } from "express";

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("MOCK TOKEN UTILISÉ");
    req.user = {
        user_id: 1,
        email: "test@test.com",
        role: "admin"
    };
    next();
};

export const verifyManager = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("MOCK MANAGER UTILISÉ");
    next();
};
