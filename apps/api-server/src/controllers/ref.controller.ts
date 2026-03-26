import { Request, Response } from 'express';
import { ReferentniPodaci } from '@nx-fmeri/api-ref';
import { getErrorMessage } from '../helpers/error.helper';

// GET /api/ref/platni-razredi?kategorija=drzavni_sluzbenik
export const getPlatniRazredi = async (req: Request, res: Response) => {
  try {
    const { kategorija } = req.query;

    const filter = kategorija
      ? { tip: 'platni_razredi', kategorija }
      : { tip: 'platni_razredi' };

    const podaci = await ReferentniPodaci.find(filter)
      .select('-__v')
      .lean();

    return res.json(podaci);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/ref/pozicije?kategorija=drzavni_sluzbenik&razred=IX
export const getPozicije = async (req: Request, res: Response) => {
  try {
    const { kategorija, razred } = req.query;

    const filter: Record<string, unknown> = { tip: 'platni_razredi' };
    if (kategorija) filter['kategorija'] = kategorija;

    const dokument = await ReferentniPodaci.findOne(filter).lean();
    if (!dokument) {
      return res.status(404).json({ message: 'Referentni podaci nisu pronađeni.' });
    }

    // Filtriraj po razredu ako je proslijeđen
    const razredi = razred
      ? dokument.podaci.filter((r) => r.razred === razred)
      : dokument.podaci;

    // Flatten — vrati sve pozicije
    const pozicije = razredi.flatMap((r) =>
      r.pozicije.map((p) => ({
        ...p,
        razred: r.razred,
        koeficijent: r.koeficijent,
      }))
    );

    return res.json(pozicije);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/ref/pozicije/:kljuc
export const getPozicijaByKljuc = async (req: Request, res: Response) => {
  try {
    const { kljuc } = req.params;

    const dokumenti = await ReferentniPodaci.find({ tip: 'platni_razredi' }).lean();

    for (const dok of dokumenti) {
      for (const razred of dok.podaci) {
        const pozicija = razred.pozicije.find((p) => p.kljuc === kljuc);
        if (pozicija) {
          return res.json({
            ...pozicija,
            razred: razred.razred,
            koeficijent: razred.koeficijent,
            kategorija: dok.kategorija,
          });
        }
      }
    }

    return res.status(404).json({ message: `Pozicija '${kljuc}' nije pronađena.` });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/ref/kategorije
export const getKategorije = async (req: Request, res: Response) => {
  try {
    const kategorije = await ReferentniPodaci.distinct('kategorija');
    return res.json(kategorije);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};
