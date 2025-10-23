import { Router } from "express";
import { AuthService } from "../services/AuthService";

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

export default router;
