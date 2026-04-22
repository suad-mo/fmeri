import { Request, Response } from 'express';
// import { User } from '@nx-fmeri/api-auth';
import {
  OrganizacionaJedinica,
  RadnoMjesto,
  Zaposlenik,
} from '@nx-fmeri/api-org';
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
      Zaposlenik.countDocuments({ aktivan: true }),
      OrganizacionaJedinica.countDocuments({ aktivna: true }),
      RadnoMjesto.countDocuments({ aktivno: true }),
      Zaposlenik.countDocuments({ aktivan: true, radnoMjesto: { $ne: null } }),
    ]);

    return res.json({
      ukupnoZaposlenika,
      ukupnoJedinica,
      ukupnoRadnihMjesta,
      zaposleniciSaRadnimMjestom,
      zaposleniciSaDodjeljenim:
        ukupnoZaposlenika > 0
          ? Math.round((zaposleniciSaRadnimMjestom / ukupnoZaposlenika) * 100)
          : 0,
    });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/stats/zaposlenici-po-sektoru
export const getZaposleniciPoSektoru = async (req: Request, res: Response) => {
  try {
    const rezultat = await Zaposlenik.aggregate([
      { $match: { aktivan: true, organizacionaJedinica: { $ne: null } } },
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

    return res.json(
      rezultat.map((r) => ({
        naziv: r._id,
        broj: r.broj,
      })),
    );
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/stats/platni-razredi
export const getPlatniRazrediStats = async (req: Request, res: Response) => {
  try {
    const rezultat = await Zaposlenik.aggregate([
      { $match: { aktivan: true, radnoMjesto: { $ne: null } } },
      {
        $lookup: {
          from: 'radnomjestos',
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

    return res.json(
      rezultat.map((r) => ({
        razred: r._id.razred,
        kategorija: r._id.kategorija,
        broj: r.broj,
        koeficijent: r.koeficijent,
      })),
    );
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

const REDOSLIJED_JEDINICA = [
  'Federalno ministarstvo energije, rudarstva i industrije',
  'Kabinet ministra',
  'Sektor energije',
  'Odsjek za elektroenergetiku',
  'Odsjek za tečne energente, plin i termoenergetiku',
  'Odsjek za razvoj',
  'Sektor rudarstva',
  'Odsjek za rudarstvo',
  'Odsjek za geologiju',
  'Sektor industrije',
  'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
  'Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
  'Odsjek za analizu i praćenje stanja u privredi',
  'Odsjek za razvoj i unapređenje privrede',
  'Sektor za pravne, finansijske i opće poslove',
  'Odsjek za pravne poslove i radne odnose',
  'Odsjek za finansijsko-računovodstvene poslove',
  'Odsjek za opće poslove',
  'Pisarnica',
  'Zavod za mjeriteljstvo',
  'Centar za mjeriteljstvo Mostar',
  'Centar za mjeriteljstvo Sarajevo',
  'Centar za mjeriteljstvo Tuzla',
  'Federalna direkcija za namjensku industriju',
];

// GET /api/stats/sistematizacija
export const getSistematizacija = async (req: Request, res: Response) => {
  try {
    const radnaMjesta = await RadnoMjesto.find({ aktivno: true })
      .populate('organizacionaJedinica', 'naziv tip')
      .lean();

    const rezultat = await Promise.all(
      radnaMjesta.map(async (rm) => {
        const popunjeno = await Zaposlenik.countDocuments({
          radnoMjesto: rm._id,
          aktivan: true,
        });
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
          status:
            popunjeno >= rm.brojIzvrsilaca
              ? 'popunjeno'
              : popunjeno > 0
                ? 'djelimicno'
                : 'slobodno',
        };
      }),
    );

    rezultat.sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aNaziv = (a.organizacionaJedinica as any)?.naziv ?? '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bNaziv = (b.organizacionaJedinica as any)?.naziv ?? '';
      const aIdx = REDOSLIJED_JEDINICA.indexOf(aNaziv);
      const bIdx = REDOSLIJED_JEDINICA.indexOf(bNaziv);
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    });

    return res.json(rezultat);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// Privremeno u stats.controller.ts
export const debugZaposlenici = async (req: Request, res: Response) => {
  const z = await Zaposlenik.findOne({ aktivan: true })
    .select('ime prezime radnoMjesto')
    .lean();
  return res.json(z);
};
