import { body } from "express-validator";
import { RoleEnum } from "../enums/role-enum";

export const loginValidator = [
    body("email")
        .isEmail()
        .withMessage("Email invalide"),

    body("password")
        .notEmpty()
        .withMessage("Mot de passe requis"),
];

export const registerValidator = [
    body("email")
        .isEmail()
        .withMessage("Email invalide"),

    body("phone_number")
        .optional()
        .matches(/^(?:\+33|0)[1-9](?:\d{2}){4}$/)
        .withMessage("Numéro de téléphone invalide"),

    body("first_name")
        .trim()
        .notEmpty()
        .withMessage("Prénom requis"),

    body("last_name")
        .trim()
        .notEmpty()
        .withMessage("Nom requis"),

    body("role")
        .isIn(Object.values(RoleEnum))
        .withMessage("Rôle invalide"),
];
