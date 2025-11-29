import { TeamModel } from "../models/team.model";

export class TeamHelper {

    getReqAllTeams(): string {
        return `SELECT t.team_id
                    t.name,
                    t.description,
                    t.manager_id
                FROM teams t
                INNER JOIN users u`;
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

    toTeamModelBySqlRow(row: any): TeamModel {
        const team = new TeamModel();
        team.team_id = row.team_id;
        team.name = row.name;
        team.description = row.description;
        return team;
    }

}