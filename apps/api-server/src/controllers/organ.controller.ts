import { Request, Response } from 'express';
import { Organ, OrganizacionaJedinica, RadnoMjesto } from '@nx-fmeri/api-org';
import { getErrorMessage } from '../helpers/error.helper';

// ── GET /api/organi ───────────────────────────────────
export const getOrgani = async (req: Request, res: Response) => {
  try {
    const organi = await Organ.find({ aktivan: true })
      .populate('nadredjeniOrgan', 'naziv skraceniNaziv')
      .sort({ redoslijed: 1 })
      .lean();
    return res.json(organi);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── GET /api/organi/:id ───────────────────────────────
export const getOrgan = async (req: Request, res: Response) => {
  try {
    const organ = await Organ.findById(req.params['id'])
      .populate('nadredjeniOrgan', 'naziv skraceniNaziv')
      .lean();
    if (!organ)
      return res.status(404).json({ message: 'Organ nije pronađen.' });
    return res.json(organ);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── GET /api/organi/:id/struktura ─────────────────────
export const getOrganStruktura = async (req: Request, res: Response) => {
  try {
    const organ = await Organ.findById(req.params['id']).lean();
    if (!organ) return res.status(404).json({ message: 'Organ nije pronađen.' });

    const jedinice = await OrganizacionaJedinica.find({
      organ: req.params['id'],
      aktivna: true,
      tip: { $ne: 'ministarstvo' }, // ← izuzmi sam organ
    })
      .sort({ nivoJedinice: 1, redoslijed: 1 })
      .lean();

    // Radna mjesta direktno u organu (Ministar, Sekretar, Savjetnici)
    // = ona čija organizacionaJedinica je sam organ (ministarstvo tip)
    const organJedinica = await OrganizacionaJedinica.findOne({
      organ: req.params['id'],
      tip: organ.vrstaOrgana === 'ministarstvo' ? 'ministarstvo' :
           organ.vrstaOrgana === 'upravna_organizacija' ?
           { $in: ['zavod', 'direkcija'] } : 'ministarstvo',
    }).lean();

    const radnaMjestaOrgana = organJedinica
      ? await RadnoMjesto.find({
          organizacionaJedinica: organJedinica._id,
          aktivno: true,
        }).lean()
      : [];

    const osnovneJedinice = jedinice.filter(j => j.nivoJedinice === 'osnovna');
    const unutrasnje = jedinice.filter(j => j.nivoJedinice === 'unutrasnja');

    const strukturaOOJ = await Promise.all(
      osnovneJedinice.map(async (ooj) => {
        const rmOOJ = await RadnoMjesto.find({
          organizacionaJedinica: ooj._id,
          aktivno: true,
        }).lean();

        const uojZaOvu = unutrasnje.filter(
          u => u.nadredjenaJedinica?.toString() === ooj._id.toString()
        );

        const uojSaRM = await Promise.all(
          uojZaOvu.map(async (uoj) => {
            const rmUOJ = await RadnoMjesto.find({
              organizacionaJedinica: uoj._id,
              aktivno: true,
            }).lean();
            return { ...uoj, radnaMjesta: rmUOJ };
          })
        );

        return {
          ...ooj,
          radnaMjesta: rmOOJ,
          unutrasnje: uojSaRM,
        };
      })
    );

    return res.json({
      organ,
      radnaMjesta: radnaMjestaOrgana,
      osnovneJedinice: strukturaOOJ,
    });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── GET /api/organi/u-sastavu/:organId ────────────────
export const getOrganiUSastavu = async (req: Request, res: Response) => {
  try {
    const organi = await Organ.find({
      nadredjeniOrgan: req.params['organId'],
      uSastavu: true,
      aktivan: true,
    })
      .sort({ redoslijed: 1 })
      .lean();
    return res.json(organi);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── POST /api/organi ──────────────────────────────────
export const createOrgan = async (req: Request, res: Response) => {
  try {
    const organ = await Organ.create(req.body);
    return res.status(201).json(organ);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// ── PATCH /api/organi/:id ─────────────────────────────
export const updateOrgan = async (req: Request, res: Response) => {
  try {
    const organ = await Organ.findByIdAndUpdate(
      req.params['id'],
      { $set: req.body },
      { new: true, runValidators: true },
    ).lean();
    if (!organ)
      return res.status(404).json({ message: 'Organ nije pronađen.' });
    return res.json(organ);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// ── DELETE /api/organi/:id ────────────────────────────
export const deleteOrgan = async (req: Request, res: Response) => {
  try {
    const organ = await Organ.findByIdAndUpdate(
      req.params['id'],
      { aktivan: false },
      { new: true },
    ).lean();
    if (!organ)
      return res.status(404).json({ message: 'Organ nije pronađen.' });
    return res.json({ message: 'Organ deaktiviran.', organ });
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── POST /api/organi/:id/osnovne-jedinice ─────────────
export const addOsnovnaJedinica = async (req: Request, res: Response) => {
  try {
    const organ = await Organ.findById(req.params['id']);
    if (!organ)
      return res.status(404).json({ message: 'Organ nije pronađen.' });

    const jedinica = await OrganizacionaJedinica.create({
      ...req.body,
      organ: organ._id,
      nivoJedinice: 'osnovna',
    });
    return res.status(201).json(jedinica);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// ── POST /api/organi/:id/unutrasnje-jedinice ──────────
export const addUnutrasnjaJedinica = async (req: Request, res: Response) => {
  try {
    const organ = await Organ.findById(req.params['id']);
    if (!organ)
      return res.status(404).json({ message: 'Organ nije pronađen.' });

    const { osnovnaJedinicaId, ...podaci } = req.body;

    const osnovnaJedinica =
      await OrganizacionaJedinica.findById(osnovnaJedinicaId);
    if (!osnovnaJedinica) {
      return res
        .status(404)
        .json({ message: 'Osnovna jedinica nije pronađena.' });
    }

    const jedinica = await OrganizacionaJedinica.create({
      ...podaci,
      organ: organ._id,
      nivoJedinice: 'unutrasnja',
      nadredjenaJedinica: osnovnaJedinicaId,
    });
    return res.status(201).json(jedinica);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

// ── POST /api/organi/:id/radna-mjesta ─────────────────
export const addRadnoMjestoOrganu = async (req: Request, res: Response) => {
  try {
    const organ = await Organ.findById(req.params['id']);
    if (!organ)
      return res.status(404).json({ message: 'Organ nije pronađen.' });

    const { osnovnaJedinicaId, unutrasnjaJedinicaId, ...podaci } = req.body;

    const rm = await RadnoMjesto.create({
      ...podaci,
      organ: organ._id,
      osnovnaJedinica: osnovnaJedinicaId ?? null,
      unutrasnjaJedinica: unutrasnjaJedinicaId ?? null,
      // Backwards compatibility
      organizacionaJedinica: unutrasnjaJedinicaId ?? osnovnaJedinicaId ?? null,
    });
    return res.status(201).json(rm);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};
