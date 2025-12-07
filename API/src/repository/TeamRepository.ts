import pool from "../config/database";
import { TeamHelper } from "../helpers/TeamHelper";
import { TeamModel } from "../models/team.model";

export class TeamRepository {

    teamHelper: TeamHelper = new TeamHelper();

    // /**
    //  * @name getAllTeams()
    //  * @memberof TeamRepository
    //  * @description Retourne toute les équipes
    //  * @returns Promise<TeamModel[]>
    //  */
    // async getAllTeams(): Promise<TeamModel[]> {
    //     let conn;
    //     try {
    //         conn = await pool.getConnection();
    //         const rows = await conn.query(this.teamHelper.getReqAllTeams());

    //         // Si ton driver MariaDB retourne une première ligne meta, supprime-la :
    //         if (Array.isArray(rows) && rows.length > 0 && typeof rows[0] === "object") {
    //             return await.Promise rows.map((row: TeamModel) => this.teamHelper.toTeamModelBySqlRow(row));
    //         }

    //         return [];
    //     } catch (error) {
    //         console.error("Erreur lors de la récupération des équipes :", error);
    //         throw error;
    //     } finally {
    //         if (conn) conn.release();
    //     }
    // }

    /**
     * @name getTeamById()
     * @memberof TeamRepository
     * @description Retourne une équipe par son id
     * @param teamId
     * @returns Promise<TeamModel>
     */
    async getTeamById(teamId: number): Promise<TeamModel> {
        let conn;
        try {
            conn = await pool.getConnection();
            const row = await conn.query(this.teamHelper.getReqTeamById(teamId));
            // Si ton driver MariaDB retourne une première ligne meta, supprime-la :
            if (Array.isArray(row) && row.length > 0 && typeof row[0] === "object") {
                return this.teamHelper.toTeamModelBySqlRow(row[0]);
            }
            else {
                return row;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs :", error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * @name createTeam()
     * @memberof TeamRepository
     * @description Creer une équipe en base de donnée
     * @param team 
     * @returns Promise<TeamModel[]>
     */
    async createTeam(team: TeamModel): Promise<TeamModel> {
        const params = [
            team.name,
            team.description,
            // team.manager_id
        ];
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query(this.teamHelper.getReqInsertTeam(), params);
            return this.teamHelper.toTeamModelBySqlRow(result[0]);
        } catch (err) {
            console.error('Erreur insert team:', err);
            throw err;
        }
    }

    /**
     * @name updateTeam()
     * @memberof TeamRepository
     * @description Met à jour une équipe en base de donnée
     * @param team 
     * @param teamId 
     * @returns Promise<TeamModel[]>
     */
    async updateTeam(team: TeamModel, teamId: number): Promise<TeamModel> {
        let checkTeam: TeamModel = await this.getTeamById(teamId);
        if (checkTeam.team_id > 0) {
            const params = [
                team.name,
                team.description,
                // team.manager_id
            ];
            let conn;
            try {
                conn = await pool.getConnection();
                await conn.query(this.teamHelper.getReqUpdateTeam(checkTeam.team_id), params);
                team.team_id = checkTeam.team_id;
                return team;
            } catch (err) {
                console.error('Erreur update team:', err);
                throw err;
            }
        }
        else {
            console.error('Erreur équipe inexistante');
            return new TeamModel();
        }
    }

    /**
     * @name deleteTeam()
     * @memberof TeamRepository
     * @param teamId
     * @description Supprime une équipe par son id en base de donnée
     * @returns 
     */
    async deleteTeam(teamId: number) {
        try {
            const sql = `DELETE FROM team WHERE team_id = ?`;
            const result = await pool.execute(sql, [teamId]);

            const affectedRows = (result as any).affectedRows;

            if (affectedRows === 0) {
                return null;
            }

            console.log(`Equipe ${teamId} supprimé (${affectedRows} ligne)`);
            return true;
        } catch (err) {
            console.error(' Erreur deleteTeam :', err);
            throw err;
        }
    }
}