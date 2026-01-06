import { AppDataSource } from "../config/database";
import { TeamHelper } from "../helpers/TeamHelper";
import { TeamModel } from "../models/Team/team.model";
import { TeamLight } from "../models/Team/team-light.model";
import { TeamEntity } from "../models/Team/TeamEntity";
import { UserEntity } from "../models/User/UserEntity";

export class TeamService {
    teamHelper: TeamHelper = new TeamHelper();
    teamRepo = AppDataSource.getRepository(TeamEntity);
    userRepo = AppDataSource.getRepository(UserEntity);

    private toTeamLight(team: TeamEntity): TeamLight {
        const light = new TeamLight();
        light.team_id = team.team_id;
        light.name = team.name;
        light.description = team.description ?? null;
        light.manager_id = team.manager ? team.manager.user_id : null;
        return light;
    }

    async getAllTeams(): Promise<TeamLight[]> {
        const teams = await this.teamRepo.find({
            relations: ["manager", "members"]
        });
        return teams.map((t) => this.toTeamLight(t));
    }

    async getTeamById(teamId: number): Promise<TeamLight> {
        const team = await this.teamRepo.findOne({
            where: { team_id: teamId },
            relations: ["manager", "members"]
        });
        if (!team) {
            throw new Error(`Aucune équipe avec cet l'Id ${teamId} en base de donnée`);
        }
        else {
            return this.toTeamLight(team);
        }
    }

    async createTeam(req: any): Promise<TeamLight> {
        let teamForCreate: TeamModel = this.teamHelper.teamModelByReqBody(req);
        let newTeam: TeamEntity = new TeamEntity();
        if (teamForCreate) {
            let checkTeam = await this.teamRepo.findOneBy({
                name: teamForCreate.name
            });
            if (checkTeam) {
                throw new Error(`L'équipe ${teamForCreate.name} existe déja !`);
            }
            else {
                let manager = teamForCreate.manager_id ? await this.userRepo.findOneBy({
                    user_id: teamForCreate.manager_id
                }) : null;
                if (!manager) {
                    throw new Error("Aucun Manager pour cet équipe");
                }
                else {
                    let teamEntity: TeamEntity = new TeamEntity();
                    teamEntity.name = teamForCreate.name;
                    teamEntity.description = teamForCreate.description;
                    teamEntity.manager = manager;
                    newTeam = await this.teamRepo.save(teamEntity);
                }
            }
        }
        const created = await this.teamRepo.findOne({
            where: { team_id: newTeam.team_id },
            relations: ["manager"]
        });
        if (!created) {
            throw new Error("Équipe créée mais introuvable");
        }
        return this.toTeamLight(created);
    }

    async updateTeam(req: any, teamId: number): Promise<TeamLight> {
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

        await this.teamRepo.save(existingTeam);

        const updated = await this.teamRepo.findOne({
            where: { team_id: teamId },
            relations: ["manager"]
        });
        if (!updated) {
            throw new Error("Équipe mise à jour mais introuvable");
        }
        return this.toTeamLight(updated);
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