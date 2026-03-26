import { Request, Response } from 'express';
import { GlobalniSablon, OrganSablon } from '@nx-fmeri/api-sablon';
import { getErrorMessage } from '../helpers/error.helper';

// ── Globalni šabloni ──────────────────────────────────

export const getGlobalniSabloni = async (req: Request, res: Response) => {
  try {
    const sabloni = await GlobalniSablon.find({ aktivno: true }).lean();
    return res.json(sabloni);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const getGlobalniSablonByTip = async (req: Request, res: Response) => {
  try {
    const sablon = await GlobalniSablon.findOne({
      tipOrgana: req.params.tip,
      aktivno: true,
    }).lean();

    if (!sablon) {
      return res.status(404).json({ message: 'Šablon nije pronađen.' });
    }
    return res.json(sablon);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const updateGlobalniSablon = async (req: Request, res: Response) => {
  try {
    const sablon = await GlobalniSablon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!sablon) {
      return res.status(404).json({ message: 'Šablon nije pronađen.' });
    }
    return res.json(sablon);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// ── Organ šabloni ─────────────────────────────────────

export const getOrganSablon = async (req: Request, res: Response) => {
  try {
    const sablon = await OrganSablon.findOne({
      organ: req.params.organId,
      aktivno: true,
    })
      .populate('globalniSablon')
      .lean();

    if (!sablon) {
      return res.status(404).json({ message: 'Šablon organa nije pronađen.' });
    }
    return res.json(sablon);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const createOrUpdateOrganSablon = async (req: Request, res: Response) => {
  try {
    const { organId } = req.params;
    const sablon = await OrganSablon.findOneAndUpdate(
      { organ: organId },
      { ...req.body, organ: organId },
      { new: true, upsert: true, runValidators: true }
    );
    return res.json(sablon);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// ── Efektivna pravila (globalni + override) ───────────

export const getEfektivnaPravila = async (req: Request, res: Response) => {
  try {
    const { organId } = req.params;

    const organSablon = await OrganSablon.findOne({ organ: organId })
      .populate('globalniSablon')
      .lean();

    if (!organSablon) {
      return res.status(404).json({ message: 'Šablon organa nije pronađen.' });
    }

    const globalni = organSablon.globalniSablon as any;

    // Primijeni overrides na globalna pravila
    const primijeniOverride = (jedinice: any[]) =>
      jedinice
        .map((j) => {
          const override = organSablon.overrides.find((o) => o.tip === j.tip);
          if (override?.aktivan === false) return null;
          return { ...j, ...override };
        })
        .filter(Boolean);

    return res.json({
      organ: organId,
      globalniSablon: globalni._id,
      tipOrgana: globalni.tipOrgana,
      osnovneJedinice: primijeniOverride(globalni.osnovneJedinice),
      unutrasnjeJedinice: primijeniOverride(globalni.unutrasnjeJedinice),
      napomena: organSablon.napomena,
    });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};
