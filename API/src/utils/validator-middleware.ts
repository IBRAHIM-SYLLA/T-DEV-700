import { Request, Response, NextFunction } from "express";
import { validationResult, FieldValidationError } from "express-validator";

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors
            .array()
            .filter((err): err is FieldValidationError => err.type === "field")
            .map(err => ({
                field: err.path,
                message: err.msg
            }));

        return res.status(400).json({
            message: "Validation error",
            errors: formattedErrors
        });
    }

    next();
};
