import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { JwtUser } from "../services/types/jwt-user";

dotenv.config();

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide" });
    }

    req.user = decoded as JwtUser;
    next();
  });
};

export const verifyManager = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Authorization header:", req.headers.authorization);

  if (!req.user) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  if (req.user.role !== "manager" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès manager requis" });
  }

  next();
};


