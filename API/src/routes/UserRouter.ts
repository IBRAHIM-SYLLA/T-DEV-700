import express, { Request, Response, Router } from "express";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repository/UserRepository";
import bcrypt from 'bcrypt';

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

/**
 * @route GET /users/:id
 * @desc Récupère un utilisateur par son id
 */
userRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        let userId: number = Number.parseInt(req.params.id);
        const user = await userService.getUserById(userId);
        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});

userRouter.post('/', async (req: Request, res: Response) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = await userService.createUser(req, hashedPassword);
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur' });
    }
});

userRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        let userId: number = Number.parseInt(req.params.id);
        const user = await userService.updateUser(req, hashedPassword, userId);
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la mise a jour de l’utilisateur' });
    }
});

userRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        let userId: number = Number.parseInt(req.params.id);
        await userService.deleteUser(userId);
        res.status(201).json(`Utilisateur ${userId} supprimé`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la suppression de l’utilisateur' });
    }
});

export default userRouter;
