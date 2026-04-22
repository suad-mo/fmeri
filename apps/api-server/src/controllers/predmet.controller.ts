import { Request, Response } from 'express';
import { Predmet } from '@nx-fmeri/api-org';
import { User } from '@nx-fmeri/api-auth';
import { getErrorMessage } from '../helpers/error.helper';

// Helper — dohvati organ i OJ iz usera
import { IZaposlenik } from '@nx-fmeri/api-org';

const dohvatiKontekstUsera = async (userId: string) => {
  const user = await User.findById(userId)
    .populate('zaposlenik')
    .lean();

  if (!user?.zaposlenik) return null;

  // const zaposlenik = user.zaposlenik as IZaposlenik;
  const zaposlenik = user.zaposlenik as unknown as IZaposlenik;
  return {
    organ: zaposlenik.organ,
    organizacionaJedinica: zaposlenik.organizacionaJedinica,
  };
};

// GET /api/predmeti — lista predmeta
export const getPredmeti = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Neautorizovan.' });
    const isAdmin = req.user?.role?.includes('admin');

    let filter: Record<string, unknown> = { aktivan: true };

    if (!isAdmin) {
      // Dohvati organ usera
      const kontekst = await dohvatiKontekstUsera(userId);
      if (kontekst?.organ) {
        // Vidi predmete svog organa
        filter = { ...filter, organ: kontekst.organ };
      } else {
        // Vidi samo vlastite predmete
        filter = { ...filter, referent: userId };
      }
    }

    const predmeti = await Predmet.find(filter)
      .populate('organ', 'naziv skraceniNaziv')
      .populate('organizacionaJedinica', 'naziv')
      .populate('referent', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(predmeti);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/predmeti/:id
export const getPredmet = async (req: Request, res: Response) => {
  try {
    const predmet = await Predmet.findById(req.params['id'])
      .populate('organ', 'naziv skraceniNaziv')
      .populate('organizacionaJedinica', 'naziv')
      .populate('referent', 'name email')
      .lean();

    if (!predmet) return res.status(404).json({ message: 'Predmet nije pronađen.' });
    return res.json(predmet);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// POST /api/predmeti
export const createPredmet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Neautorizovan.' });

    const kontekst = await dohvatiKontekstUsera(userId);

    // Ako user nema zaposlenika (npr. admin), uzmi organ iz requesta
    const organ = kontekst?.organ ?? req.body.organ;
    const organizacionaJedinica = kontekst?.organizacionaJedinica ?? req.body.organizacionaJedinica;

    if (!organ) {
      return res.status(400).json({ message: 'Organ je obavezan.' });
    }

    const predmet = await Predmet.create({
      ...req.body,
      organ,
      organizacionaJedinica,
      referent: userId,
    });

    return res.status(201).json(predmet);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// PATCH /api/predmeti/:id
export const updatePredmet = async (req: Request, res: Response) => {
  try {
    const predmet = await Predmet.findByIdAndUpdate(
      req.params['id'],
      { ...req.body },
      { new: true, runValidators: true }
    )
      .populate('organ', 'naziv skraceniNaziv')
      .populate('organizacionaJedinica', 'naziv')
      .populate('referent', 'name email');

    if (!predmet) return res.status(404).json({ message: 'Predmet nije pronađen.' });
    return res.json(predmet);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// DELETE /api/predmeti/:id — soft delete
export const deletePredmet = async (req: Request, res: Response) => {
  try {
    await Predmet.findByIdAndUpdate(req.params['id'], { aktivan: false });
    return res.json({ message: 'Predmet obrisan.' });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// POST /api/predmeti/:id/akti — dodaj akt
export const addAkt = async (req: Request, res: Response) => {
  try {
    const predmet = await Predmet.findById(req.params['id']);
    if (!predmet) return res.status(404).json({ message: 'Predmet nije pronađen.' });

    predmet.akti.push(req.body);
    await predmet.save();

    return res.status(201).json(predmet);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// PATCH /api/predmeti/:id/akti/:aktId — uredi akt
export const updateAkt = async (req: Request, res: Response) => {
  try {
    const predmet = await Predmet.findById(req.params['id']);
    if (!predmet) return res.status(404).json({ message: 'Predmet nije pronađen.' });

    const akt = predmet.akti.id(req.params['aktId']);
    if (!akt) return res.status(404).json({ message: 'Akt nije pronađen.' });

    Object.assign(akt, req.body);
    await predmet.save();

    return res.json(predmet);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// DELETE /api/predmeti/:id/akti/:aktId — obriši akt
export const deleteAkt = async (req: Request, res: Response) => {
  try {
    const predmet = await Predmet.findById(req.params['id']);
    if (!predmet) return res.status(404).json({ message: 'Predmet nije pronađen.' });

    predmet.akti.pull({ _id: req.params['aktId'] });
    await predmet.save();

    return res.json(predmet);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};
