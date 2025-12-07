import { AppDataSource } from "../config/database";
import { TeamHelper } from "../helpers/TeamHelper";
import { TeamModel } from "../models/team.model";
import { TeamRepository } from "../repository/TeamRepository";

export class TeamService {
    teamHelper: TeamHelper = new TeamHelper();

    constructor(private teamRepository: TeamRepository) { }

    async getAllTeams(): Promise<TeamModel[]> {
        const teamRepo = AppDataSource.getRepository(TeamModel);

        const teams = await teamRepo.find({
            relations: ["manager", "members"]
        });
        return teams;
    }

    async getTeamById(teamId: number): Promise<TeamModel> {
        return this.teamRepository.getTeamById(teamId);
    }

    async createTeam(req: any): Promise<TeamModel> {
        return this.teamRepository.createTeam(this.teamHelper.teamModelByReqBody(req));
    }

    async updateTeam(req: any, teamId: number) {
        return this.teamRepository.updateTeam(this.teamHelper.teamModelByReqBody(req), teamId);
    }

    async deleteTeam(teamId: number) {
        return this.teamRepository.deleteTeam(teamId);
    }
}