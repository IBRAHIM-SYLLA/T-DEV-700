import express, { Request, Response, Router } from "express";
import { UserService } from "../services/user-service";
import { ClockService } from "../services/clock-service";
import { verifyAdminRh, verifyManager, verifyToken } from "../utils/UserMiddleware";
import { createUserValidator, updateUserValidator } from "../validators/user.validators";
import { validateRequest } from "../utils/validator-middleware";

const userRouter: Router = express.Router();

// Création des instances
const userService = new UserService();
const clockService = new ClockService();
/**
 * @route GET /users
 * @desc Récupère tous les utilisateurs
 */
userRouter.get("/", verifyToken, verifyAdminRh, async (req: Request, res: Response) => {
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
userRouter.get("/:id", verifyToken, verifyManager, async (req: Request, res: Response) => {
    try {
        const userId: number = Number.parseInt(req.params.id);
        const user = await userService.getUserById(userId);
        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});

/**
 * @route POST /users/
 * @desc Creer un utilisateur
 */
userRouter.post(
    '/',
    verifyToken,
    verifyAdminRh,
    createUserValidator,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const user = await userService.createUser(req);
            res.status(201).json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur' });
        }
    });

/**
 * @route PUT /users/
 * @desc Met à jour un utilisateur
 */
userRouter.put('/:id',
    verifyToken,
    updateUserValidator,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const userId: number = Number.parseInt(req.params.id);
            const user = await userService.updateUser(userId, req);
            res.status(201).json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erreur lors de la mise a jour de l’utilisateur' });
        }
    });

/**
 * @route DELETE /users/
 * @desc Supprime un utilisateur
 */
userRouter.delete('/:id', verifyToken, verifyManager, async (req: Request, res: Response) => {
    try {
        const userId: number = Number.parseInt(req.params.id);
        await userService.deleteUser(userId);
        res.status(201).json(`Utilisateur ${userId} supprimé`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la suppression de l’utilisateur' });
    }
});

/**
 * @route POST /users/:id/clocks
 * @desc Creer un pointage
 */
userRouter.get("/:id/clocks", verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const clocks = await clockService.getUserClocksSummary(userId);
        res.status(200).json(clocks);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default userRouter;
