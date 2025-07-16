// types/express.d.ts
import { Request } from 'express';

// Estendendo a interface Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email?: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export {};
