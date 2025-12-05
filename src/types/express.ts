import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Remplace `any` par le type exact de ton utilisateur 
    }
  }
}
