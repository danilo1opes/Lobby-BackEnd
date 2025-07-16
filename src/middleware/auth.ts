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

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Auth middleware chamado'); // Debug log
  console.log('Headers:', req.headers.authorization); // Debug log

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.log('Token não fornecido'); // Debug log
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret',
    );
    console.log('Token decodificado:', decoded); // Debug log
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.log('Token inválido:', error); // Debug log
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
