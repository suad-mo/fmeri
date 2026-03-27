import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from '@nx-fmeri/api-auth';

interface JwtPayload {
  id: string;
  email: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
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

    // Dohvati korisnika iz baze da dobijemo role
    const user = await User.findById(decoded.id).select('email role').lean();
    if (!user) {
      res.status(401).json({ message: 'Korisnik nije pronađen.' });
      return;
    }

    req.user = {
      id: decoded.id,
      email: user.email,
      role: user.role ?? [],
    };

    return next();
  } catch {
    res.status(401).json({ message: 'Token nije validan ili je istekao.' });
    return;
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Nije autorizovan.' });
    }

    const userRoles: string[] = req.user.role ?? [];
    const hasRole = roles.some((r) => userRoles.includes(r));

    if (!hasRole) {
      return res.status(403).json({ message: 'Nemate dozvolu za ovu akciju.' });
    }

    return next();
  };
};
