import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

export const validate = <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) : void => {
    try {
      const data: T = schema.parse(req.body);
      req.body = data;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formattedErrors = err.issues.map((e) => {
          const field = e.path.join(".");

          const value = e.path.reduce(
            (obj: any, key) => obj?.[key],
            req.body
          );

          return {
            field,
            message: e.message,
            value,
            type: typeof value,
          };
        });

        res.status(400).json({
          result: false,
          message: "Validation error",
          errors: formattedErrors,
        });
        return 
      }
      

       res.status(500).json({
        message: "Internal server error",
      });
      return
    }
  };