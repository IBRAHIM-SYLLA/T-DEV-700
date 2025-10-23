import { UserRepository } from "../repository/UserRepository";
import { UserModel } from "../models/user.model";
import { UserHelper } from "../helpers/UserHelper";

export class UserService {
    userHelper: UserHelper = new UserHelper();
    // le repository est injecté via le constructeur
    constructor(private userRepository: UserRepository) { }

    /**
     * Retourne tous les utilisateurs
     */
    async getAllUsers(): Promise<UserModel[]> {
        return await this.userRepository.getAllUsers();
    }

    async getUserById(userId: number): Promise<UserModel> {
        return await this.userRepository.getUserById(userId);
    }

    /**
     * @name createUser()
     * @memberof UserService
     * @param req
     * @description Creer un utilisateur et le renvoie
     * @returns  Promise<UserModel>
     */
    async createUser(req: any, hashedPassword: string): Promise<UserModel> {
        return await this.userRepository.createUser(this.userHelper.userModelByReqBody(req, hashedPassword));
    }

    /**
 * @name updateUser()
 * @memberof UserService
 * @param req
 * @description Creer un utilisateur et le renvoie
 * @returns  Promise<UserModel>
 */
    async updateUser(req: any, hashedPassword: string, userId: number): Promise<UserModel> {
        return await this.userRepository.updateUser(this.userHelper.userModelByReqBody(req, hashedPassword), userId);
    }

    async deleteUser(userId: number) {
        return await this.userRepository.deleteUser(userId);
    }
}
