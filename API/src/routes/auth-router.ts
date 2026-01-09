import { Router } from "express";
import { AuthService } from "../services/auth-service";
import { PasswordResetService } from "../services/password-reset-service";

const router = Router();

// ➕ Enregistrement
router.post("/register", async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// 🔑 Connexion
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
});


/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Demande de réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email envoyé (même si l'email n'existe pas)
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    await PasswordResetService.createResetRequest(email);
    
    // Toujours répondre la même chose pour la sécurité
    res.status(200).json({
      message: "Si cet email existe, un lien de réinitialisation a été envoyé"
    });
  } catch (err: any) {
    console.error("Erreur forgot-password:", err);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
  }
});

/**
 * @swagger
 * /api/auth/verify-reset-token/{token}:
 *   get:
 *     summary: Vérifie la validité d'un token de réinitialisation
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statut de validité du token
 */
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const result = await PasswordResetService.verifyToken(token);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialise le mot de passe avec un token valide
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - new_password
 *             properties:
 *               token:
 *                 type: string
 *               new_password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ message: "Token et nouveau mot de passe requis" });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
    }

    await PasswordResetService.resetPassword(token, new_password);
    
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});
export default router;
