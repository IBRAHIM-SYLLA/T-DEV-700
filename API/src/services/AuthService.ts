import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repository/UserRepository";
import dotenv from "dotenv";
import { UserModel } from "../models/User/user.model";

dotenv.config();

export class AuthService {
  private static userRepository = new UserRepository();

  private static isBcryptHash(value: string): boolean {
    return typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);
  }

  /**
   * @name register
   * @param user
   * @description Crée un nouvel utilisateur avec un mot de passe hashé
   */
  static async register(user: UserModel): Promise<{ message: string }> {
    try {
      const existingUser = await this.userRepository.findByEmail(user.email);
      if (existingUser) {
        throw new Error("Un utilisateur avec cet email existe déjà.");
      }

      // Hash du mot de passe
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;

      // Création dans la base
      await this.userRepository.createUser(user);
      return { message: "Utilisateur créé avec succès" };
    } catch (error: any) {
      console.error("Erreur AuthService.register :", error);
      throw new Error(error.message || "Erreur lors de l'inscription");
    }
  }

  /**
   * @name login
   * @param email
   * @param password
   * @description Authentifie un utilisateur et renvoie un token JWT
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: UserModel }> {
    try {
      const normalizedEmail = String(email ?? "").trim();
      const user = await this.userRepository.findByEmail(normalizedEmail);
      if (!user) throw new Error("Email ou mot de passe incorrect");

      let validPassword = false;
      if (this.isBcryptHash(user.password)) {
        validPassword = await bcrypt.compare(password, user.password);
      } else {
        // Compat seed: init.sql stocke des passwords en clair
        validPassword = password === user.password;

        // Upgrade immédiat vers bcrypt si OK
        if (validPassword) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await this.userRepository.updatePassword(user.user_id, hashedPassword);
          user.password = hashedPassword;
        }
      }

      if (!validPassword) throw new Error("Email ou mot de passe incorrect");

      // Génération du token JWT
      const token = jwt.sign(
        {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "24h" }
      );

      // Ne jamais renvoyer le mot de passe au frontend
      return { token, user: { ...user, password: "" } };
    } catch (error: any) {
      console.error("Erreur AuthService.login :", error);
      throw new Error(error.message || "Erreur lors de la connexion");
    }
  }
}
