import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email: string;
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'Niste autorizovani, token nedostaje.' });
    return;
  }

  try {
    const secret = process.env['JWT_SECRET'] as string;
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // req.user je IUser tip iz express.d.ts — castamo kroz unknown
    req.user = { _id: decoded.id, email: decoded.email } as unknown as Express.Request['user'];

    return next();
  } catch {
    res.status(401).json({ message: 'Token nije validan ili je istekao.' });
    return;
  }
};
