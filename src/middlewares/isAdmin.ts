import { Request, Response, NextFunction } from "express";
import User from "../models/users";

import { validate } from "./validate";
import { requireAdminSchema } from "../schemas/isAdmin.schema";


export const requireAdmin = [
  // 1️⃣ Validation du token avec Zod
(req: Request, res: Response, next: NextFunction) => {
    try {
      // Ici on valide que le token est présent dans le body ou header
      const data = { accessToken: req.headers['authorization'] || req.body.accessToken };
      requireAdminSchema.parse(data);
      next();
    } catch (err: any) {
      res.status(400).json({ result: false, message: err.errors });
      return 
    }
  },
  // 2️⃣ Vérification côté DB
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'] || req.body.accessToken;

    const user = await User.findOne({ accessToken: token });
    if (!user || !user.isAdmin) {
       res.status(403).json({ message: "Accès interdit" });
       return
    }

    req.user = user;
    next();
  }
];
