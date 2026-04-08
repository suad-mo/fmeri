import { Request, Response } from 'express';
import {
  Organ,
  OrganizacionaJedinica,
  RadnoMjesto,
  Zaposlenik,
} from '@nx-fmeri/api-org';
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
    if (!organ)
      return res.status(404).json({ message: 'Organ nije pronađen.' });

    const jedinice = await OrganizacionaJedinica.find({
      organ: req.params['id'],
      aktivna: true,
    })
      .sort({ nivoJedinice: 1, redoslijed: 1 })
      .lean();

    const organJedinica = await OrganizacionaJedinica.findOne({
      organ: req.params['id'],
      tip: { $in: ['ministarstvo', 'zavod', 'direkcija'] },
    }).lean();

    // Helper — dohvati RM sa zaposlenicima
    const rmSaZaposlenicima = async (filter: Record<string, unknown>) => {
      const radnaMjesta = await RadnoMjesto.find({
        ...filter,
        aktivno: true,
      }).lean();

      return Promise.all(
        radnaMjesta.map(async (rm) => {
          const zaposlenici = await Zaposlenik.find({
            radnoMjesto: rm._id,
            aktivan: true,
          })
            .select('ime prezime sluzbeniEmail slika')
            .lean();
          return { ...rm, zaposlenici };
        }),
      );
    };

    // Radna mjesta direktno u organu
    const radnaMjestaOrgana = organJedinica
      ? await rmSaZaposlenicima({ organizacionaJedinica: organJedinica._id })
      : [];

    const osnovneJedinice = jedinice.filter(
      (j) =>
        j.nivoJedinice === 'osnovna' &&
        !['ministarstvo', 'direkcija', 'zavod'].includes(j.tip),
    );
    const unutrasnje = jedinice.filter((j) => j.nivoJedinice === 'unutrasnja');

    const strukturaOOJ = await Promise.all(
      osnovneJedinice.map(async (ooj) => {
        const rmOOJ = await rmSaZaposlenicima({
          organizacionaJedinica: ooj._id,
        });

        const uojZaOvu = unutrasnje.filter(
          (u) => u.nadredjenaJedinica?.toString() === ooj._id.toString(),
        );

        const uojSaRM = await Promise.all(
          uojZaOvu.map(async (uoj) => {
            const rmUOJ = await rmSaZaposlenicima({
              organizacionaJedinica: uoj._id,
            });
            return { ...uoj, radnaMjesta: rmUOJ };
          }),
        );

        return {
          ...ooj,
          radnaMjesta: rmOOJ,
          unutrasnje: uojSaRM,
        };
      }),
    );

    const zaposleniciUOrganu = await Zaposlenik.find({
      organ: req.params['id'],
      organizacionaJedinica: null,
      aktivan: true,
    })
      .select('ime prezime sluzbeniEmail slika radnoMjesto')
      .lean();

    return res.json({
      organ,
      radnaMjesta: radnaMjestaOrgana,
      zaposleniciUOrganu, // ← dodaj
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

// ── GET /api/organi/popunjenost ───────────────────────
export const getPopunjenost = async (req: Request, res: Response) => {
  try {
    const organi = await Organ.find({ aktivan: true })
      .sort({ redoslijed: 1 })
      .lean();

    const rezultati = await Promise.all(
      organi.map(async (organ) => {
        const jedinice = await OrganizacionaJedinica.find({
          organ: organ._id,
          aktivna: true,
        }).lean();

        const radnaMjesta = await RadnoMjesto.find({
          organizacionaJedinica: { $in: jedinice.map((j) => j._id) },
          aktivno: true,
        }).lean();

        const zaposlenici = await Zaposlenik.find({
          organ: organ._id,
          aktivan: true,
        })
          .select('radnoMjesto')
          .lean();

        // Izračunaj popunjenost po RM
        const rmSaBrojem = radnaMjesta.map((rm) => {
          const popunjeno = zaposlenici.filter(
            (z) => z.radnoMjesto?.toString() === rm._id.toString(),
          ).length;
          return {
            rmId: rm._id,
            naziv: rm.naziv,
            organizacionaJedinica: rm.organizacionaJedinica,
            kategorijaZaposlenog: rm.kategorijaZaposlenog,
            brojIzvrsilaca: rm.brojIzvrsilaca,
            popunjeno,
            upraznjeno: Math.max(0, rm.brojIzvrsilaca - popunjeno),
          };
        });

        const ukupnoRM = rmSaBrojem.reduce((s, rm) => s + rm.brojIzvrsilaca, 0);
        const ukupnoPopunjeno = rmSaBrojem.reduce(
          (s, rm) => s + rm.popunjeno,
          0,
        );

        // Grupiranje po OJ
        const poJedinicama = jedinice
          .map((j) => {
            const rmJedinice = rmSaBrojem.filter(
              (rm) => rm.organizacionaJedinica?.toString() === j._id.toString(),
            );
            const ukupno = rmJedinice.reduce(
              (s, rm) => s + rm.brojIzvrsilaca,
              0,
            );
            const popunjeno = rmJedinice.reduce((s, rm) => s + rm.popunjeno, 0);
            return {
              jedinicaId: j._id,
              naziv: j.naziv,
              tip: j.tip,
              nivoJedinice: j.nivoJedinice,
              ukupnoRM: ukupno,
              popunjeno,
              upraznjeno: Math.max(0, ukupno - popunjeno),
              posto: ukupno > 0 ? Math.round((popunjeno / ukupno) * 100) : 0,
            };
          })
          .filter((j) => j.ukupnoRM > 0);

        return {
          organId: organ._id,
          naziv: organ.naziv,
          skraceniNaziv: organ.skraceniNaziv,
          vrstaOrgana: organ.vrstaOrgana,
          ukupnoRM,
          popunjeno: ukupnoPopunjeno,
          upraznjeno: Math.max(0, ukupnoRM - ukupnoPopunjeno),
          posto:
            ukupnoRM > 0 ? Math.round((ukupnoPopunjeno / ukupnoRM) * 100) : 0,
          poJedinicama,
        };
      }),
    );

    return res.json(rezultati);
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

export const getRadnaMjestaOrgana = async (req: Request, res: Response) => {
  try {
    const organJedinica = await OrganizacionaJedinica.findOne({
      organ: req.params['id'],
      tip: { $in: ['ministarstvo', 'zavod', 'direkcija'] },
    }).lean();

    if (!organJedinica) return res.json([]);

    const radnaMjesta = await RadnoMjesto.find({
      organizacionaJedinica: organJedinica._id,
      aktivno: true,
    }).lean();

    return res.json(radnaMjesta);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── PATCH /api/organi/:id/radna-mjesta/:rmId/zaposlenik ──
export const dodjelaZaposlenikaNaRM = async (req: Request, res: Response) => {
  try {
    const { zaposlenikId } = req.body;

    // Ukloni zaposlenika s prethodnog RM ako postoji
    await Zaposlenik.updateMany(
      { radnoMjesto: req.params['rmId'] },
      { $set: { radnoMjesto: null } },
    );

    if (zaposlenikId) {
      await Zaposlenik.findByIdAndUpdate(zaposlenikId, {
        $set: {
          radnoMjesto: req.params['rmId'],
          organ: req.params['id'],
        },
      });
    }

    const rm = await RadnoMjesto.findById(req.params['rmId']).lean();
    return res.json(rm);
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

// ── PATCH /api/organi/:id/jedinice/:jedinicaId ────────────
export const updateJedinica = async (req: Request, res: Response) => {
  try {
    const jedinica = await OrganizacionaJedinica.findByIdAndUpdate(
      req.params['jedinicaId'],
      { $set: req.body },
      { new: true, runValidators: true },
    ).lean();
    if (!jedinica) {
      return res.status(404).json({ message: 'Org. jedinica nije pronađena.' });
    }
    return res.json(jedinica);
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};
