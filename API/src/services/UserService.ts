import { UserRepository } from "../repository/UserRepository";
import { UserModel } from "../models/user.model";

export class UserService {

    // le repository est injecté via le constructeur
    constructor(private userRepository: UserRepository) { }

    /**
     * Retourne tous les utilisateurs
     */
    async getAllUsers(): Promise<UserModel[]> {
        return await this.userRepository.getAllUsers();
    }
}
