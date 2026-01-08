import { AppDataSource } from "../config/database";
import { TeamHelper } from "../helpers/TeamHelper";
import { TeamModel } from "../models/Team/team.model";
import { TeamEntity } from "../models/Team/TeamEntity";
import { UserEntity } from "../models/User/UserEntity";

export class TeamService {
    teamHelper: TeamHelper = new TeamHelper();
    teamRepo = AppDataSource.getRepository(TeamEntity);
    userRepo = AppDataSource.getRepository(UserEntity);

    async getAllTeams(): Promise<TeamEntity[]> {
        const teams = await this.teamRepo.find({
            relations: ["manager", "members"]
        });
        return teams;
    }

    async getTeamById(teamId: number): Promise<TeamEntity> {
        const team = await this.teamRepo.findOne({
            where: { team_id: teamId },
            relations: ["manager", "members"]
        });
        if (!team) {
            throw new Error(`Aucune équipe avec cet l'Id ${teamId} en base de donnée`);
        }
        else {
            return team
        }
    }

    /**
     * Récupère toutes les équipes d'un manager avec leurs membres
     */
    async getTeamsByManager(managerId: number) {
        return this.teamRepo.find({
            where: {
                manager: {
                    user_id: managerId
                }
            },
            relations: {
                members: true,
                manager: true
            }
        });
    }

    async createTeam(req: any): Promise<TeamEntity> {
        const teamForCreate: TeamModel = this.teamHelper.teamModelByReqBody(req);
        let newTeam: TeamEntity = new TeamEntity();
        if (teamForCreate) {
            const checkTeam = await this.teamRepo.findOneBy({
                name: teamForCreate.name
            });
            if (checkTeam) {
                throw new Error(`L'équipe ${teamForCreate.name} existe déja !`);
            }
            else {
                const manager = teamForCreate.manager_id ? await this.userRepo.findOneBy({
                    user_id: teamForCreate.manager_id
                }) : null;
                if (!manager) {
                    throw new Error("Aucun Manager pour cet équipe");
                }
                else {
                    const teamEntity: TeamEntity = new TeamEntity();
                    teamEntity.name = teamForCreate.name;
                    teamEntity.description = teamForCreate.description;
                    teamEntity.manager = manager;
                    newTeam = await this.teamRepo.save(teamEntity);
                }
            }
        }
        return newTeam;
    }

    async updateTeam(req: any, teamId: number): Promise<TeamEntity> {
        if (!teamId) {
            throw new Error("team_id manquant pour la mise à jour.");
        }

        const existingTeam = await this.teamRepo.findOne({
            where: { team_id: teamId },
            relations: ["manager"]
        });

        if (!existingTeam) {
            throw new Error(`Aucune équipe trouvée avec l'id ${teamId}`);
        }
        const teamForUpdate: TeamModel = this.teamHelper.teamModelByReqBody(req);

        if (teamForUpdate.name) {
            const existingWithName = await this.teamRepo.findOneBy({
                name: teamForUpdate.name
            });
            if (existingWithName && existingWithName.team_id !== teamId) {
                throw new Error(`L'équipe ${teamForUpdate.name} existe déjà !`);
            }
        }

        let newManager = null;
        if (teamForUpdate.manager_id) {
            newManager = await this.userRepo.findOneBy({
                user_id: teamForUpdate.manager_id
            });
            if (!newManager) {
                throw new Error("Manager invalide.");
            }
        }

        existingTeam.name = teamForUpdate.name ?? existingTeam.name;
        existingTeam.description = teamForUpdate.description ?? existingTeam.description;
        existingTeam.manager = newManager ?? existingTeam.manager;

        const updatedTeam = await this.teamRepo.save(existingTeam);
        return updatedTeam;
    }

    async deleteTeam(teamId: number): Promise<void> {
        const team = await this.teamRepo.findOne({
            where: { team_id: teamId },
            relations: ["members"]
        });

        if (!team) {
            throw new Error(`L'équipe avec l'id ${teamId} n'existe pas.`);
        }
        if (team.members && team.members.length > 0) {
            for (const user of team.members) {
                user.team = null;
                await this.userRepo.save(user);
            }
        }
        await this.teamRepo.delete(teamId);
    }

}