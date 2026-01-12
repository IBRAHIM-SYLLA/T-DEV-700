import { body, param } from "express-validator";
import { RoleEnum } from "../enums/role-enum";

export const createUserValidator = [
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

export const updateUserValidator = [
    param("id")
        .isInt()
        .withMessage("ID utilisateur invalide"),

    body("email")
        .optional()
        .isEmail()
        .withMessage("Email invalide"),

    body("phone_number")
        .optional()
        .matches(/^(?:\+33|0)[1-9](?:\d{2}){4}$/)
        .withMessage("Numéro de téléphone invalide"),

    body("first_name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Prénom invalide"),

    body("last_name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Nom invalide"),
];
