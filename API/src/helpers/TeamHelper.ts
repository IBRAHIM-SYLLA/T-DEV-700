import { TeamModel } from "../models/Team/team.model";
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

    teamModelByReqBody(req: any): TeamModel {
        const team = new TeamModel();
        team.name = req.body.name;
        team.description = req.body.description;
        team.manager_id = req.body.manager_id;
        return team;
    }

}