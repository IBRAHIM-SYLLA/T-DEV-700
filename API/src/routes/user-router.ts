import express, { Request, Response, Router } from "express";
import { UserService } from "../services/user-service";
import { ClockService } from "../services/clock-service";

const userRouter: Router = express.Router();

// Création des instances
const userService = new UserService();
const clockService = new ClockService();
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
        const user = await userService.createUser(req);
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur' });
    }
});

userRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const saltRounds = 10;
        let userId: number = Number.parseInt(req.params.id);
        const user = await userService.updateUser(userId, req);
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

/**
 * GET /users/:id/clocks
 */
userRouter.get("/:id/clocks", async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.id);
        const clocks = await clockService.getUserClocksSummary(userId);
        res.status(200).json(clocks);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default userRouter;
