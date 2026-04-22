import { Request, Response } from 'express';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { User } from '@nx-fmeri/api-auth';
import { getErrorMessage } from '../helpers/error.helper';

// Cookie opcije
// const accessTokenCookieOptions = {
//   httpOnly: true,
//   secure: process.env['NODE_ENV'] === 'production', // HTTPS u produkciji
//   sameSite: 'strict' as const,
//   maxAge: 60 * 60 * 1000, // 1h
// };

// const refreshTokenCookieOptions = {
//   httpOnly: true,
//   secure: process.env['NODE_ENV'] === 'production',
//   sameSite: 'strict' as const,
//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dana
//   path: '/api/auth/refresh', // Samo za refresh endpoint
// };

// const accessTokenCookieOptions = {
//   httpOnly: true,
//   secure: process.env['NODE_ENV'] === 'production',
//   sameSite: (process.env['NODE_ENV'] === 'production' ? 'lax' : 'strict') as
//     | 'lax'
//     | 'strict',
//   maxAge: 60 * 60 * 1000,
// };

// const refreshTokenCookieOptions = {
//   httpOnly: true,
//   secure: process.env['NODE_ENV'] === 'production',
//   sameSite: (process.env['NODE_ENV'] === 'production' ? 'lax' : 'strict') as
//     | 'lax'
//     | 'strict',
//   maxAge: 7 * 24 * 60 * 60 * 1000,
//   path: '/api/auth/refresh',
// };

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: false, // ← samo za HTTPS produkciju, ne za lokalni pristup
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 1000,
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: false, // ← isto
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth/refresh',
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email });
    await user.setPassword(password);

    // Generiši refresh token i sačuvaj u bazu
    const refreshToken = user.generateRefreshToken();
    await user.save();

    const authData = user.toAuthJSON();

    // Setuj tokene kao HttpOnly cookies
    res.cookie('access_token', authData.token, accessTokenCookieOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenCookieOptions);

    return res.status(201).json(authData);
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

    // Generiši refresh token i sačuvaj u bazu
    const refreshToken = user.generateRefreshToken();
    const authData = user.toAuthJSON();
    await user.save();

    // Setuj tokene kao HttpOnly cookies
    res.cookie('access_token', authData.token, accessTokenCookieOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenCookieOptions);

    return res.json(authData);
  } catch (error: unknown) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    // Čitaj refresh token iz cookie umjesto body
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token nedostaje.' });
    }

    const secret = process.env['JWT_REFRESH_SECRET'] as string;
    const decoded = jwt.verify(refreshToken, secret) as { id: string };

    const hashed = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: hashed,
      refreshTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Refresh token nije validan.' });
    }

    // Token rotation — novi par tokena
    const newRefreshToken = user.generateRefreshToken();
    const authData = user.toAuthJSON();
    await user.save();

    res.cookie('access_token', authData.token, accessTokenCookieOptions);
    res.cookie('refresh_token', newRefreshToken, refreshTokenCookieOptions);

    return res.json(authData);
  } catch {
    return res
      .status(401)
      .json({ message: 'Refresh token nije validan ili je istekao.' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      const secret = process.env['JWT_REFRESH_SECRET'] as string;
      try {
        const decoded = jwt.verify(refreshToken, secret) as { id: string };
        await User.findByIdAndUpdate(decoded.id, {
          $unset: { refreshToken: 1, refreshTokenExpiry: 1 },
        });
      } catch {
        // Token istekao ali svejedno brišemo cookie
      }
    }

    // Obriši oba cookija
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });

    return res.status(200).json({ message: 'Uspješno ste se odjavili.' });
  } catch {
    return res.status(500).json({ message: 'Greška pri odjavi.' });
  }
};
