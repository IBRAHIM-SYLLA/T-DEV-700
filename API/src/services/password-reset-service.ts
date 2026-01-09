import { AppDataSource } from "../config/database";
import { PasswordResetEntity } from "../models/PasswordReset/PasswordResetEntity";
import { UserEntity } from "../models/User/UserEntity";
import { EmailService } from "./email-service";
import crypto from "crypto";
import bcrypt from "bcrypt";

export class PasswordResetService {
    private static tokenRepo = AppDataSource.getRepository(PasswordResetEntity);
    private static userRepo = AppDataSource.getRepository(UserEntity);

    /**
     * Génère un token sécurisé de 64 caractères
     */
    private static generateToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Génère un mot de passe temporaire aléatoire
     */
    static generateTemporaryPassword(): string {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        
        // Assurer au moins une minuscule, majuscule, chiffre et caractère spécial
        password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
        password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
        password += "0123456789"[Math.floor(Math.random() * 10)];
        password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
        
        // Compléter le reste
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }
        
        // Mélanger les caractères
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    /**
     * Crée une demande de réinitialisation de mot de passe
     */
    static async createResetRequest(email: string): Promise<void> {
        const user = await this.userRepo.findOne({ where: { email } });
        
        if (!user) {
            // Pour des raisons de sécurité, ne pas révéler si l'email existe
            console.log(`⚠️ Tentative de reset pour email inexistant: ${email}`);
            return; // On ne throw pas d'erreur
        }

        // Invalider tous les tokens existants pour cet utilisateur
        await this.tokenRepo.update(
            { user: { user_id: user.user_id }, used: false },
            { used: true }
        );

        // Créer un nouveau token
        const token = this.generateToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Expire dans 1 heure

        const resetToken = new PasswordResetEntity();
        resetToken.user = user;
        resetToken.token = token;
        resetToken.expires_at = expiresAt;

        await this.tokenRepo.save(resetToken);

        // Envoyer l'email
        await EmailService.sendPasswordResetEmail(email, token);
    }

    /**
     * Vérifie la validité d'un token
     */
    static async verifyToken(token: string): Promise<{ valid: boolean; userId?: number }> {
        const resetToken = await this.tokenRepo.findOne({
            where: { token },
            relations: ["user"]
        });

        if (!resetToken) {
            return { valid: false };
        }

        if (resetToken.used) {
            return { valid: false };
        }

        if (new Date() > resetToken.expires_at) {
            return { valid: false };
        }

        return { valid: true, userId: resetToken.user.user_id };
    }

    /**
     * Réinitialise le mot de passe avec un token valide
     */
    static async resetPassword(token: string, newPassword: string): Promise<void> {
        const verification = await this.verifyToken(token);

        if (!verification.valid || !verification.userId) {
            throw new Error("Token invalide ou expiré");
        }

        const user = await this.userRepo.findOne({
            where: { user_id: verification.userId }
        });

        if (!user) {
            throw new Error("Utilisateur introuvable");
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await this.userRepo.save(user);

        // Marquer le token comme utilisé
        await this.tokenRepo.update({ token }, { used: true });

        // Envoyer un email de confirmation
        await EmailService.sendPasswordChangedEmail(user.email);

        console.log(`✅ Mot de passe réinitialisé pour ${user.email}`);
    }
}
