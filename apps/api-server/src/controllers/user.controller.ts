import { Request, Response } from 'express';
import { User } from '@nx-fmeri/api-auth';
import * as path from 'path';
import * as fs from 'fs';
import { getErrorMessage } from '../helpers/error.helper';

// GET /api/users/me
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id)
      // .populate('organizacionaJedinica', 'naziv tipJedinice')
      // .populate('radnoMjesto', 'naziv pozicijaKljuc platniRazred koeficijent')
      .populate('zaposlenik', '_id ime prezime') // ← dodaj populate
      .select('-hash -refreshToken -resetToken')
      .lean();

    if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// PATCH /api/users/me/lozinka
export const promijeniLozinku = async (req: Request, res: Response) => {
  try {
    const { trenutnaLozinka, novaLozinka } = req.body;

    if (!trenutnaLozinka || !novaLozinka) {
      return res.status(400).json({ message: 'Obje lozinke su obavezne.' });
    }

    if (novaLozinka.length < 8) {
      return res.status(400).json({ message: 'Nova lozinka mora imati najmanje 8 znakova.' });
    }

    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });

    const validan = await user.validPassword(trenutnaLozinka);
    if (!validan) {
      return res.status(401).json({ message: 'Trenutna lozinka nije ispravna.' });
    }

    await user.setPassword(novaLozinka);
    await user.save();

    return res.json({ message: 'Lozinka uspješno promijenjena.' });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// POST /api/users/me/slika
export const uploadSlika = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Fajl nije uploadovan.' });
    }

    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });

    // Obriši staru sliku ako postoji
    if (user.slika) {
      const staraSlika = path.join(__dirname, '../../../../../uploads/slike', user.slika);
      if (fs.existsSync(staraSlika)) fs.unlinkSync(staraSlika);
    }

    user.slika = req.file.filename;
    await user.save();

    return res.json({ slika: req.file.filename });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      // .populate('organizacionaJedinica', 'naziv tipJedinice')
      // .populate('radnoMjesto', 'naziv pozicijaKljuc platniRazred')
      .select('-hash -refreshToken -resetToken')
      .lean();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// PATCH /api/users/:id/dodjela
// export const dodjelaOrgRM = async (req: Request, res: Response) => {
//   try {
//     const { organizacionaJedinica, radnoMjesto } = req.body;

//     const user = await User.findByIdAndUpdate(
//       req.params['id'],
//       { organizacionaJedinica, radnoMjesto },
//       { new: true, runValidators: true }
//     )
//       .populate('organizacionaJedinica', 'naziv tipJedinice')
//       .populate('radnoMjesto', 'naziv pozicijaKljuc platniRazred')
//       .select('-hash -refreshToken -resetToken');

//     if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });
//     return res.json(user);
//   } catch (error) {
//     return res.status(400).json({ error: getErrorMessage(error) });
//   }
// };

// POST /api/users — kreiranje novog korisnika (admin)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Ime, email i lozinka su obavezni.' });
    }

    const postojeci = await User.findOne({ email });
    if (postojeci) {
      return res.status(400).json({ message: 'Korisnik s tim emailom već postoji.' });
    }

    const user = new User({ name, email, role: role ?? ['user'] });
    await user.setPassword(password);
    await user.save();

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// PATCH /api/users/:id/role — izmjena role
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    if (!Array.isArray(role)) {
      return res.status(400).json({ message: 'Role mora biti array.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params['id'],
      { role },
      { new: true }
    ).select('-hash -refreshToken -resetToken');

    if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });
    return res.json(user);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// PATCH /api/users/:id/reset-lozinka — admin reset lozinke
export const resetLozinka = async (req: Request, res: Response) => {
  try {
    const { novaLozinka } = req.body;

    if (!novaLozinka || novaLozinka.length < 8) {
      return res.status(400).json({ message: 'Lozinka mora imati najmanje 8 znakova.' });
    }

    const user = await User.findById(req.params['id']);
    if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });

    await user.setPassword(novaLozinka);
    await user.save();

    return res.json({ message: 'Lozinka uspješno resetovana.' });
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// PATCH /api/users/:id/zaposlenik — poveži korisnika sa zaposlenikom
export const poveziZaposlenika = async (req: Request, res: Response) => {
  try {
    const { zaposlenikId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params['id'],
      { zaposlenik: zaposlenikId ?? null },
      { new: true }
    ).select('-hash -refreshToken -resetToken');

    if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });
    return res.json(user);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};
