import { Request, Response } from 'express';
import { User } from '@nx-fmeri/api-auth';
import { getErrorMessage } from '../helpers/error.helper';

// function getErrorMessage(error: unknown): string {
//   if (error instanceof Error) return error.message;
//   return String(error)
// }

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const user = new User({ name, email });

    // Naša nova Argon2 metoda iz lib-a
    await user.setPassword(password);

    await user.save();

    return res.status(201).json(user.toAuthJSON());
  } catch (error: unknown) {
    // Umjesto any koristimo uncown i naš helper
    return res.status(400).json({ error: getErrorMessage(error) });
  }
  // } catch (error) {
  //   if (error instanceof Error) {
  //     return res.status(400).json({ error: error.message });
  //   }
  //   return res.status(400).json({ error: 'Desila se nepoznata greška!' });
  // }
};

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user || !(await user.validPassword(password))) {
//       return res.status(401).json({ message: 'Pogrešan email ili lozinka' });
//     }

//     return res.json(user.toAuthJSON());
//   } catch (error: any) {
//     return res.status(500).json({ error: error.message });
//   }
// };

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Pronađi korisnika preko emaila
    const user = await User.findOne({ email });

    // 2. Ako korisnik ne postoji
    if (!user) {
      return res.status(401).json({ message: 'Korisnik nije pronađen!' });
    }

    // 3. Provjeri lozinku koristeći Argon2 metodu iz naše biblioteke
    const isPasswordValid = await user.validPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Pogrešna lozinka!' });
    }

    // 4. Ako je sve OK, vrati AuthJSON (novi token)
    return res.json(user.toAuthJSON());
  } catch (error: unknown) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
  // } catch (error) {
  //   if (error instanceof Error) {
  //     return res.status(400).json({ error: error.message });
  //   }
  //   return res.status(500).json({ error: 'Desila se nepoznata greška!' });
  // }
};
