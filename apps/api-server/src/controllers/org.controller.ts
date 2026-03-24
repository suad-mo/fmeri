import { Request, Response } from 'express';
import { OrganizacionaJedinica } from '@nx-fmeri/api-org';
import { RadnoMjesto } from '@nx-fmeri/api-org';
import { getErrorMessage } from '../helpers/error.helper';

// ── Organizacione jedinice ────────────────────────────────

export const getAll = async (req: Request, res: Response) => {
  try {
    const jedinice = await OrganizacionaJedinica.find({ aktivna: true })
      .populate('nadredjenaJedinica', 'naziv tip')
      .populate('rukovodilac', 'name email')
      .sort({ redoslijed: 1, naziv: 1 });
    return res.json(jedinice);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const jedinica = await OrganizacionaJedinica.findById(req.params.id)
      .populate('nadredjenaJedinica', 'naziv tip')
      .populate('rukovodilac', 'name email');
    if (!jedinica) {
      return res.status(404).json({ message: 'Organizaciona jedinica nije pronađena.' });
    }
    return res.json(jedinica);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const jedinica = new OrganizacionaJedinica(req.body);
    await jedinica.save();
    return res.status(201).json(jedinica);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const jedinica = await OrganizacionaJedinica.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!jedinica) {
      return res.status(404).json({ message: 'Organizaciona jedinica nije pronađena.' });
    }
    return res.json(jedinica);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    // Soft delete — ne brišemo, samo deaktiviramo
    const jedinica = await OrganizacionaJedinica.findByIdAndUpdate(
      req.params.id,
      { aktivna: false },
      { new: true }
    );
    if (!jedinica) {
      return res.status(404).json({ message: 'Organizaciona jedinica nije pronađena.' });
    }
    return res.json({ message: 'Organizaciona jedinica deaktivirana.' });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const getStablo = async (req: Request, res: Response) => {
  try {
    // Dohvati sve jedinice i kreiraj stablo u memoriji
    const sve = await OrganizacionaJedinica.find({ aktivna: true })
      .sort({ redoslijed: 1, naziv: 1 })
      .lean();

    const mapa = new Map(sve.map((j) => [j._id.toString(), { ...j, djeca: [] as any[] }]));

    const stablo: any[] = [];

    for (const jedinica of mapa.values()) {
      if (!jedinica.nadredjenaJedinica) {
        stablo.push(jedinica);
      } else {
        const roditelj = mapa.get(jedinica.nadredjenaJedinica.toString());
        if (roditelj) {
          roditelj.djeca.push(jedinica);
        }
      }
    }

    return res.json(stablo);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── Radna mjesta ──────────────────────────────────────────

export const getRadnaMjesta = async (req: Request, res: Response) => {
  try {
    const filter = req.query.jedinica
      ? { organizacionaJedinica: req.query.jedinica, aktivno: true }
      : { aktivno: true };

    const mjesta = await RadnoMjesto.find(filter)
      .populate('organizacionaJedinica', 'naziv tip')
      .sort({ nivo: 1, naziv: 1 });
    return res.json(mjesta);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const createRadnoMjesto = async (req: Request, res: Response) => {
  try {
    const mjesto = new RadnoMjesto(req.body);
    await mjesto.save();
    return res.status(201).json(mjesto);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

export const updateRadnoMjesto = async (req: Request, res: Response) => {
  try {
    const mjesto = await RadnoMjesto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!mjesto) {
      return res.status(404).json({ message: 'Radno mjesto nije pronađeno.' });
    }
    return res.json(mjesto);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

export const removeRadnoMjesto = async (req: Request, res: Response) => {
  try {
    await RadnoMjesto.findByIdAndUpdate(req.params.id, { aktivno: false });
    return res.json({ message: 'Radno mjesto deaktivirano.' });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};
