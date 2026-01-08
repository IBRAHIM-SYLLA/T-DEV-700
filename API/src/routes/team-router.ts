import express, { Router, Request, Response } from "express";
import { TeamService } from "../services/team-service";

const teamRouter: Router = express.Router();

const teamService: TeamService = new TeamService();

teamRouter.get("/", async (req: Request, res: Response) => {
    try {
        const teams = await teamService.getAllTeams();
        res.status(200).json(teams);
    } catch (error) {
        console.error("Erreur lors de la récupération des équipes :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
})

teamRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const team = await teamService.getTeamById(Number.parseInt(req.params.id));
        res.status(200).json(team);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'équipes :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
})

teamRouter.post("/", async (req: Request, res: Response) => {
    try {
        const team = await teamService.createTeam(req);
        res.status(201).json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de l’équipe' });
    }
})

teamRouter.put("/:id", async (req: Request, res: Response) => {
    try {
        const team = await teamService.updateTeam(req, Number.parseInt(req.params.id));
        res.status(201).json(team)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise a jour de l’équipe" });
    }
})

teamRouter.delete("/:id", async (req: Request, res: Response) => {
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