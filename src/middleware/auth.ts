// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// export const authMiddleware = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ error: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || 'fallback_secret',
//     );
//     (req as any).user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ error: 'Invalid token' });
//   }
// };

// export const generateToken = (payload: object) => {
//   return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
//     expiresIn: '24h',
//   });
// };

// export const generateResetToken = (payload: {
//   id: string;
//   username: string;
// }) => {
//   return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
//     expiresIn: '1h',
//   });
// };

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface para o payload do JWT
interface JWTPayload {
  id: string;
  username: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret',
    ) as JWTPayload;

    // Agora o TypeScript reconhece req.user
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const generateToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '24h',
  });
};

export const generateResetToken = (payload: {
  id: string;
  username: string;
}) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '1h',
  });
};
