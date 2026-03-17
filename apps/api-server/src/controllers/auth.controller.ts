import { Request, Response } from 'express';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { User } from '@nx-fmeri/api-auth';
import { getErrorMessage } from '../helpers/error.helper';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email });
    await user.setPassword(password);
    await user.save();
    return res.status(201).json(user.toAuthJSON());
  } catch (error: unknown) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Korisnik nije pronađen!' });
    }

    const isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Pogrešna lozinka!' });
    }

    // Sačuvaj refresh token u bazu
    const authData = user.toAuthJSON();
    await user.save();

    return res.json(authData);
  } catch (error: unknown) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token nedostaje.' });
    }

    // 1. Verifikuj JWT potpis
    const secret = process.env['JWT_REFRESH_SECRET'] as string;
    const decoded = jwt.verify(refreshToken, secret) as { id: string };

    // 2. Hashuj primljeni token i uporedi s bazom
    const hashed = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: hashed,
      refreshTokenExpiry: { $gt: new Date() }, // nije istekao
    });

    if (!user) {
      return res.status(401).json({ message: 'Refresh token nije validan.' });
    }

    // 3. Izdaj novi par tokena (rotation)
    const authData = user.toAuthJSON();
    await user.save();

    return res.json(authData);
  } catch {
    return res.status(401).json({ message: 'Refresh token nije validan ili je istekao.' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token nedostaje.' });
    }

    const secret = process.env['JWT_REFRESH_SECRET'] as string;
    const decoded = jwt.verify(refreshToken, secret) as { id: string };

    // Obriši refresh token iz baze — token je invalidiran
    await User.findByIdAndUpdate(decoded.id, {
      $unset: { refreshToken: 1, refreshTokenExpiry: 1 },
    });

    return res.status(200).json({ message: 'Uspješno ste se odjavili.' });
  } catch {
    return res.status(401).json({ message: 'Refresh token nije validan.' });
  }
};
