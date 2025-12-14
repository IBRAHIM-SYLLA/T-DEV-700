import { UserEntity } from "../models/User/UserEntity";
import { UserHelper } from "../helpers/UserHelper";
import { AppDataSource } from "../config/database";
import { UserModel } from "../models/User/user.model";
import { TeamEntity } from "../models/Team/TeamEntity";
import { UserLight } from "../models/User/user-light.model";

export class UserService {
    userHelper: UserHelper = new UserHelper();
    userRepo = AppDataSource.getRepository(UserEntity);
    teamRepo = AppDataSource.getRepository(TeamEntity);

    /**
     * Retourne tous les utilisateurs
     */
    async getAllUsers(): Promise<UserLight[]> {
        const users = await this.userRepo.find({
            relations: ["team", "managed_teams"]
        });
        return this.userHelper.toUserLightArray(users);
    }

    async getUserById(userId: number): Promise<UserLight> {
        const user = await this.userRepo.findOne({
            where: { user_id: userId },
            relations: ["team", "managed_teams"]
        });
        if (!user) {
            throw new Error(`Aucun utilisateur avec cet l'Id ${userId} en base de donnée`);
        }
        else {
            return this.userHelper.toUserLight(user);
        }
    }

    /**
     * @name createUser()
     * @memberof UserService
     * @param req
     * @description Creer un utilisateur et le renvoie
     * @returns  Promise<UserModel>
     */
    async createUser(req: any): Promise<UserEntity> {
        const userToCreate: UserModel = await this.userHelper.userModelByReqBody(req);
        const existingUser = await this.userRepo.findOneBy({
            email: userToCreate.email
        });

        if (existingUser) {
            throw new Error(`L'utilisateur avec l'email ${userToCreate.email} existe déjà.`);
        }

        let team: TeamEntity | null = null;
        if (userToCreate.team_id) {
            team = await this.teamRepo.findOneBy({
                team_id: userToCreate.team_id
            });

            if (!team) {
                throw new Error(`Aucune équipe trouvée avec l'id ${userToCreate.team_id}.`);
            }
        }
        const userEntity = new UserEntity();
        userEntity.first_name = userToCreate.first_name;
        userEntity.last_name = userToCreate.last_name;
        userEntity.email = userToCreate.email;
        userEntity.phone_number = userToCreate.phone_number;
        userEntity.password = userToCreate.password;
        userEntity.role = userToCreate.role as any;
        userEntity.team = team;

        const newUser = await this.userRepo.save(userEntity);

        return newUser;
    }


    /**
 * @name updateUser()
 * @memberof UserService
 * @param req
 * @description Creer un utilisateur et le renvoie
 * @returns  Promise<UserModel>
 */
    async updateUser(userId: number, req: any): Promise<UserEntity> {
        const existing = await this.userRepo.findOne({
            where: { user_id: userId },
            relations: ["team"]
        });

        if (!existing) {
            throw new Error(`L'utilisateur ${userId} n'existe pas`);
        }


        existing.first_name = req.first_name ?? existing.first_name;
        existing.last_name = req.last_name ?? existing.last_name;
        existing.email = req.email ?? existing.email;
        existing.phone_number = req.phone_number ?? existing.phone_number;
        existing.role = req.role ?? existing.role;

        if (req.password) {
            existing.password = await this.userHelper.hashString(req.password, 10);
        }

        if (req.team_id !== undefined) {
            if (req.team_id === null) {
                // Désassignation
                existing.team = null;
            } else {
                const team = await this.teamRepo.findOneBy({ team_id: req.team_id });
                if (!team) throw new Error("L'équipe n'existe pas");
                existing.team = team;
            }
        }
        return await this.userRepo.save(existing);
    }


    async deleteUser(userId: number): Promise<void> {
        const user = await this.userRepo.findOne({
            where: { user_id: userId },
            relations: ["team", "managed_teams"]
        });

        if (!user) {
            throw new Error("Utilisateur introuvable");
        }

        // Désassigner l’équipe
        if (user.team) {
            user.team = null;
            await this.userRepo.save(user);
        }

        // Désassigner les équipes qu’il manage
        if (user.managed_teams.length > 0) {
            for (const team of user.managed_teams) {
                team.manager = null;
                await this.teamRepo.save(team);
            }
        }

        await this.userRepo.remove(user);
    }

}
