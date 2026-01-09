import express, { Router, Request, Response } from "express";
import { TeamService } from "../services/team-service";
import { verifyAdminRh, verifyManager, verifyToken } from "../utils/UserMiddleware";
import { log } from "console";

const teamRouter: Router = express.Router();

const teamService: TeamService = new TeamService();

/**
 * GET /teams/manager/:managerId
 * Récupère toutes les équipes d'un manager avec leurs membres
 */
teamRouter.get("/manageTeams", verifyToken, verifyManager, async (req: Request, res: Response) => {
    try {
        console.log("test eret");

        const managerId = req.user!.user_id;

        if (isNaN(managerId)) {
            return res.status(400).json({ message: "managerId invalide" });
        }

        const teams = await teamService.getTeamsByManager(managerId);

        return res.status(200).json(teams);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});


/**
 * @route POST /teams/
 * @desc Creer un utilisateur
 */
teamRouter.get("/", verifyToken, verifyAdminRh, async (req: Request, res: Response) => {
    try {
        const teams = await teamService.getAllTeams();
        res.status(200).json(teams);
    } catch (error) {
        console.error("Erreur lors de la récupération des équipes :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
})

teamRouter.get("/:id", verifyToken, verifyAdminRh, async (req: Request, res: Response) => {
    try {
        console.log("test eret");
        const team = await teamService.getTeamById(Number.parseInt(req.params.id));
        res.status(200).json(team);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'équipes :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
})


teamRouter.post("/", verifyToken, verifyAdminRh, async (req: Request, res: Response) => {
    try {
        const team = await teamService.createTeam(req);
        res.status(201).json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de l’équipe' });
    }
})

teamRouter.put("/:id", verifyToken, verifyAdminRh, async (req: Request, res: Response) => {
    try {
        const team = await teamService.updateTeam(req, Number.parseInt(req.params.id));
        res.status(201).json(team)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise a jour de l’équipe" });
    }
})

teamRouter.delete("/:id", verifyToken, verifyAdminRh, async (req: Request, res: Response) => {
    try {
        const teamId = Number.parseInt(req.params.id)
        await teamService.deleteTeam(teamId)
        res.status(201).json(`Equipe ${teamId} supprimé`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'équipe" });
    }
})

export default teamRouter;