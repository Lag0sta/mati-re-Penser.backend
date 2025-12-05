import { Router } from 'express';
import { Request, Response } from "express";

import { requireAdmin } from '../middlewares/isAdmin';
const router = Router();

router.get('/admin-data', requireAdmin, (req : Request, res : Response) => {
  res.json({ secret: "top secret admin data" });
});

export default router;