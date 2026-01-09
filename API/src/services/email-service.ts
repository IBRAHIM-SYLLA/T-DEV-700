import nodemailer from "nodemailer";
import { UserEntity } from "../models/User/UserEntity";

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: process.env.MAILPIT_HOST || "localhost",
        port: Number(process.env.MAILPIT_PORT) || 1025,
        secure: false,
        auth: undefined, // Mailpit ne nécessite pas d'auth
        tls: {
            rejectUnauthorized: false
        }
    });

    /**
     * Envoie un email de bienvenue avec identifiants
     */
    static async sendWelcomeEmail(user: UserEntity, temporaryPassword: string): Promise<void> {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || "noreply@timemanager.local",
                to: user.email,
                subject: "Bienvenue sur Time Manager - Vos identifiants",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Bienvenue ${user.first_name} ${user.last_name} !</h2>
                        <p>Votre compte Time Manager a été créé avec succès.</p>
                        
                        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Vos identifiants de connexion :</h3>
                            <p><strong>Email :</strong> ${user.email}</p>
                            <p><strong>Mot de passe temporaire :</strong> <code style="background-color: #fff; padding: 5px 10px; border-radius: 3px;">${temporaryPassword}</code></p>
                        </div>
                        
                        <p style="color: #e74c3c;"><strong>⚠️ Important :</strong> Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.</p>
                        
                        <p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                               style="display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                                Se connecter
                            </a>
                        </p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        <p style="color: #999; font-size: 12px;">
                            Si vous n'avez pas demandé cette inscription, veuillez ignorer cet email.
                        </p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email de bienvenue envoyé à ${user.email}`);
        } catch (error) {
            console.error("❌ Erreur lors de l'envoi de l'email de bienvenue:", error);
            throw new Error("Impossible d'envoyer l'email de bienvenue");
        }
    }

    /**
     * Envoie un email de réinitialisation de mot de passe
     */
    static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        try {
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
            
            const mailOptions = {
                from: process.env.EMAIL_FROM || "noreply@timemanager.local",
                to: email,
                subject: "Réinitialisation de votre mot de passe - Time Manager",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
                        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                        
                        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                        
                        <p>
                            <a href="${resetLink}" 
                               style="display: inline-block; background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                                Réinitialiser mon mot de passe
                            </a>
                        </p>
                        
                        <p style="color: #999; font-size: 14px; margin-top: 20px;">
                            Ou copiez ce lien dans votre navigateur :<br>
                            <code style="background-color: #f5f5f5; padding: 5px; display: inline-block; margin-top: 5px;">${resetLink}</code>
                        </p>
                        
                        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>⏰ Ce lien expire dans 1 heure.</strong></p>
                        </div>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        <p style="color: #999; font-size: 12px;">
                            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe reste inchangé.
                        </p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email de réinitialisation envoyé à ${email}`);
        } catch (error) {
            console.error("❌ Erreur lors de l'envoi de l'email de réinitialisation:", error);
            throw new Error("Impossible d'envoyer l'email de réinitialisation");
        }
    }

    /**
     * Envoie un email de confirmation de changement de mot de passe
     */
    static async sendPasswordChangedEmail(email: string): Promise<void> {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || "noreply@timemanager.local",
                to: email,
                subject: "Votre mot de passe a été modifié - Time Manager",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #27ae60;">✅ Mot de passe modifié avec succès</h2>
                        <p>Votre mot de passe a été changé avec succès.</p>
                        
                        <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0;">Si vous n'êtes pas à l'origine de ce changement, contactez immédiatement l'administrateur.</p>
                        </div>
                        
                        <p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                               style="display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                                Se connecter
                            </a>
                        </p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email de confirmation envoyé à ${email}`);
        } catch (error) {
            console.error("❌ Erreur lors de l'envoi de l'email de confirmation:", error);
        }
    }
}
