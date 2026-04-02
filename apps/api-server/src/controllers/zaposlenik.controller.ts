import { Request, Response } from 'express';
import { Zaposlenik } from '@nx-fmeri/api-org';
import { getErrorMessage } from '../helpers/error.helper';

// ── GET /api/zaposlenici ──────────────────────────────
export const getZaposlenici = async (req: Request, res: Response) => {
  try {
    const { organ, organizacionaJedinica, radnoMjesto, aktivan } = req.query;

    const filter: Record<string, unknown> = {};
    if (organ) filter['organ'] = organ;
    if (organizacionaJedinica) filter['organizacionaJedinica'] = organizacionaJedinica;
    if (radnoMjesto) filter['radnoMjesto'] = radnoMjesto;
    if (aktivan !== undefined) filter['aktivan'] = aktivan === 'true';
    else filter['aktivan'] = true;

    const zaposlenici = await Zaposlenik.find(filter)
      .populate('organ', 'naziv skraceniNaziv')
      .populate('organizacionaJedinica', 'naziv tip')
      .populate('radnoMjesto', 'naziv pozicijaKljuc platniRazred koeficijent')
      .populate('user', 'email role')
      .sort({ prezime: 1, ime: 1 })
      .lean();

    return res.json(zaposlenici);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── GET /api/zaposlenici/:id ──────────────────────────
export const getZaposlenik = async (req: Request, res: Response) => {
  try {
    const zaposlenik = await Zaposlenik.findById(req.params['id'])
      .populate('organ', 'naziv skraceniNaziv')
      .populate('organizacionaJedinica', 'naziv tip')
      .populate('radnoMjesto', 'naziv pozicijaKljuc platniRazred koeficijent kategorijaZaposlenog')
      .populate('user', 'email role')
      .lean();

    if (!zaposlenik) {
      return res.status(404).json({ message: 'Zaposlenik nije pronađen.' });
    }
    return res.json(zaposlenik);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── POST /api/zaposlenici ─────────────────────────────
export const createZaposlenik = async (req: Request, res: Response) => {
  try {
    const zaposlenik = await Zaposlenik.create(req.body);
    return res.status(201).json(zaposlenik);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// ── PATCH /api/zaposlenici/:id ────────────────────────
export const updateZaposlenik = async (req: Request, res: Response) => {
  try {
    const zaposlenik = await Zaposlenik.findByIdAndUpdate(
      req.params['id'],
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('organ', 'naziv skraceniNaziv')
      .populate('organizacionaJedinica', 'naziv tip')
      .populate('radnoMjesto', 'naziv pozicijaKljuc platniRazred koeficijent')
      .lean();

    if (!zaposlenik) {
      return res.status(404).json({ message: 'Zaposlenik nije pronađen.' });
    }
    return res.json(zaposlenik);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// ── DELETE /api/zaposlenici/:id ───────────────────────
export const deleteZaposlenik = async (req: Request, res: Response) => {
  try {
    const zaposlenik = await Zaposlenik.findByIdAndUpdate(
      req.params['id'],
      { aktivan: false },
      { new: true }
    ).lean();

    if (!zaposlenik) {
      return res.status(404).json({ message: 'Zaposlenik nije pronađen.' });
    }
    return res.json({ message: 'Zaposlenik deaktiviran.', zaposlenik });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── PATCH /api/zaposlenici/:id/dodjela ───────────────
export const dodjelaOrgRM = async (req: Request, res: Response) => {
  try {
    const { organ, organizacionaJedinica, radnoMjesto } = req.body;

    const zaposlenik = await Zaposlenik.findByIdAndUpdate(
      req.params['id'],
      {
        $set: {
          organ: organ ?? null,
          organizacionaJedinica: organizacionaJedinica ?? null,
          radnoMjesto: radnoMjesto ?? null,
        },
      },
      { new: true }
    )
      .populate('organ', 'naziv skraceniNaziv')
      .populate('organizacionaJedinica', 'naziv tip')
      .populate('radnoMjesto', 'naziv pozicijaKljuc platniRazred koeficijent')
      .lean();

    if (!zaposlenik) {
      return res.status(404).json({ message: 'Zaposlenik nije pronađen.' });
    }
    return res.json(zaposlenik);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// ── GET /api/zaposlenici/me ───────────────────────────
export const getMe = async (req: Request, res: Response) => {
  try {
    const zaposlenik = await Zaposlenik.findOne({ user: req.user?.id })
      .populate('organ', 'naziv skraceniNaziv')
      .populate('organizacionaJedinica', 'naziv tip')
      .populate('radnoMjesto', 'naziv pozicijaKljuc platniRazred koeficijent kategorijaZaposlenog')
      .lean();

    if (!zaposlenik) {
      return res.status(404).json({ message: 'Zaposlenik nije pronađen.' });
    }
    return res.json(zaposlenik);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};
