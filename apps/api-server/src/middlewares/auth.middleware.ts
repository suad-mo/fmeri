import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (
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
    const decoded = jwt.verify(token, secret) as { id: string; email: string };

    // req.user sada dolazi iz globalnog Express.Request (express.d.ts)
    // IUser ima _id, pa mapiramo decoded JWT payload na očekivani oblik
    req.user = {
      _id: decoded.id,
      email: decoded.email,
    } as any;

    return next();
  } catch {
    res.status(401).json({ message: 'Token nije validan ili je istekao.' });
    return;
  }
};
