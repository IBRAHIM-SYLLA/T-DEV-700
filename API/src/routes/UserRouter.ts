import express, { Request, Response, Router } from "express";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repository/UserRepository";

const userRouter: Router = express.Router();

// Création des instances
const userRepository = new UserRepository();
const userService = new UserService(userRepository);

/**
 * @route GET /users
 * @desc Récupère tous les utilisateurs
 */
userRouter.get("/", async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});

export default userRouter;
