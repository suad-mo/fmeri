import { Request, Response } from 'express';
import { User } from '@nx-fmeri/api-auth';
import { OrganizacionaJedinica, RadnoMjesto } from '@nx-fmeri/api-org';
import { getErrorMessage } from '../helpers/error.helper';

// GET /api/stats/dashboard
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const [
      ukupnoZaposlenika,
      ukupnoJedinica,
      ukupnoRadnihMjesta,
      zaposleniciSaRadnimMjestom,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      OrganizacionaJedinica.countDocuments({ aktivna: true }),
      RadnoMjesto.countDocuments({ aktivno: true }),
      User.countDocuments({ role: 'user', radnoMjesto: { $ne: null } }),
    ]);

    return res.json({
      ukupnoZaposlenika,
      ukupnoJedinica,
      ukupnoRadnihMjesta,
      zaposleniciSaRadnimMjestom,
      zaposleniciSaDodjeljenim: Math.round(
        (zaposleniciSaRadnimMjestom / ukupnoZaposlenika) * 100
      ),
    });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/stats/zaposlenici-po-sektoru
export const getZaposleniciPoSektoru = async (req: Request, res: Response) => {
  try {
    const rezultat = await User.aggregate([
      { $match: { role: 'user', organizacionaJedinica: { $ne: null } } },
      {
        $lookup: {
          from: 'organizacionajedinicas',
          localField: 'organizacionaJedinica',
          foreignField: '_id',
          as: 'jedinica',
        },
      },
      { $unwind: '$jedinica' },
      {
        $group: {
          _id: '$jedinica.naziv',
          broj: { $sum: 1 },
        },
      },
      { $sort: { broj: -1 } },
      { $limit: 10 },
    ]);

    return res.json(rezultat.map((r) => ({
      naziv: r._id,
      broj: r.broj,
    })));
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/stats/platni-razredi
export const getPlatniRazrediStats = async (req: Request, res: Response) => {
  try {
    const rezultat = await User.aggregate([
      { $match: { role: 'user', radnoMjesto: { $ne: null } } },
      {
        $lookup: {
          from: 'radnamjestos',
          localField: 'radnoMjesto',
          foreignField: '_id',
          as: 'rm',
        },
      },
      { $unwind: '$rm' },
      {
        $group: {
          _id: {
            razred: '$rm.platniRazred',
            kategorija: '$rm.kategorijaZaposlenog',
          },
          broj: { $sum: 1 },
          koeficijent: { $first: '$rm.koeficijent' },
        },
      },
      { $sort: { '_id.razred': 1 } },
    ]);

    return res.json(rezultat.map((r) => ({
      razred: r._id.razred,
      kategorija: r._id.kategorija,
      broj: r.broj,
      koeficijent: r.koeficijent,
    })));
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/stats/sistematizacija
export const getSistematizacija = async (req: Request, res: Response) => {
  try {
    const radnaMjesta = await RadnoMjesto.find({ aktivno: true })
      .populate('organizacionaJedinica', 'naziv tipJedinice')
      .lean();

    // Za svako radno mjesto provjeri koliko korisnika je dodijeljeno
    const rezultat = await Promise.all(
      radnaMjesta.map(async (rm) => {
        const popunjeno = await User.countDocuments({ radnoMjesto: rm._id });
        return {
          _id: rm._id,
          naziv: rm.naziv,
          organizacionaJedinica: rm.organizacionaJedinica,
          pozicijaKljuc: rm.pozicijaKljuc,
          platniRazred: rm.platniRazred,
          koeficijent: rm.koeficijent,
          kategorijaZaposlenog: rm.kategorijaZaposlenog,
          brojIzvrsilaca: rm.brojIzvrsilaca,
          popunjeno,
          slobodna: Math.max(0, rm.brojIzvrsilaca - popunjeno),
          status: popunjeno >= rm.brojIzvrsilaca ? 'popunjeno' :
                  popunjeno > 0 ? 'djelimicno' : 'slobodno',
        };
      })
    );

    return res.json(rezultat);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};
