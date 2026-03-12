import { log } from 'console';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Proširujemo Request interfejs da bi TypeScript znao da sada imamo 'user' objekat u zahtjevu
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Provjeri da li token postoji u Authorization Headeru (format: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: 'Niste autorizovani, token nedostaje.' });
  }

  try {
    // 2. Verifikacija tokena
    const secret = process.env['JWT_SECRET'] || 'fallback_secret';
    const decoded = jwt.verify(token, secret) as { id: string; email: string };

    // 3. Dodaj dekodirane podatke u request objekat da bi ih kontroleri mogli koristiti
    req.user = decoded;

    // 4. Pusti zahtjev dalje
    return next();
  } catch {
    return res.status(401).json({ message: 'Token nije validan ili je istekao.' });
  }
};
