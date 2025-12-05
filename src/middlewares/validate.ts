import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate = <T>(schema: ZodType<T>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: T = schema.parse(req.body);
    req.body = data;
    next();
  } catch (err) {
    res.status(400).json({ error: (err as any).errors || (err as any).message });
  }
};
