import { TeamModel } from "../models/team.model";
import { UserModel } from "../models/user.model";
import { UserHelper } from "./UserHelper";

export class TeamHelper {

    userHelper: UserHelper = new UserHelper();
    ROLE_MANAGER: string = "manager";

    getReqAllTeams(): string {
        return `SELECT t.team_id,
                    t.name,
                    t.description,
                    t.manager_id
                FROM teams t`;
    }

    getReqTeamById(teamId: number): string {
        return `SELECT t.team_id
                    t.name,
                    t.description,
                    t.manager_id
                FROM teams t
                WHERE t.team_id = ${teamId}`;
    }

    getReqInsertTeam(): string {
        return `
        INSERT INTO teams (
            name,
            description,
            manager_id
        )
        VALUES (?, ?, ?)
        RETURNING team_id, name, description, manager_id;
    `;
    }

    getReqUpdateTeam(teamId: number): string {
        return `
            UPDATE teams 
            SET
                name = ?,
                description = ?,
                manager_id = ?,
            WHERE team_id = ${teamId}
        `;
    }

    async toTeamModelBySqlRow(row: any): Promise<TeamModel> {
        const team = new TeamModel();
        team.team_id = row.team_id;
        team.name = row.name;
        team.description = row.description;
        team.members = await this.userHelper.getUserForTeam(team.team_id);
        team.manager = team.members.find(m => m.role == this.ROLE_MANAGER) ?? new UserModel();
        return team;
    }

    teamModelByReqBody(req: any): TeamModel {
        const team = new TeamModel();
        team.name = req.body.name;
        team.description = req.body.description;
        team.manager_id = req.body.manager_id;
        return team;
    }

}