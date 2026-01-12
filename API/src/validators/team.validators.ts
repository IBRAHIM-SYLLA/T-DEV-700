import { body, param } from "express-validator";

export const createTeamValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Nom d’équipe requis"),

    body("manager_id")
        .isInt()
        .withMessage("manager_id invalide"),
];

export const teamIdValidator = [
    param("id")
        .isInt()
        .withMessage("ID d’équipe invalide"),
];
