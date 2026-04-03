import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { Organ, OrganizacionaJedinica, RadnoMjesto } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  // ══════════════════════════════════════════════════
  // 1. DOHVATI POSTOJEĆI ORGAN
  // ══════════════════════════════════════════════════
  const fdni = await Organ.findOne({ skraceniNaziv: 'FDNI' });
  if (!fdni) {
    throw new Error('FDNI organ nije pronađen! Pokreni seed-organ prvo.');
  }
  const organId = fdni._id as mongoose.Types.ObjectId;
  console.log(`✓ Organ: ${fdni.naziv} [${organId}]`);

  // ══════════════════════════════════════════════════
  // 2. HELPERI
  // ══════════════════════════════════════════════════
  const upsertJedinica = async (
    naziv: string,
    tip: string,
    nadredjenaJedinica: mongoose.Types.ObjectId | null,
    nivoJedinice: string,
    redoslijed: number,
    extras: Record<string, unknown> = {}
  ) => {
    return OrganizacionaJedinica.findOneAndUpdate(
      { naziv, organ: organId },
      {
        $set: {
          naziv, tip, nadredjenaJedinica,
          organ: organId, nivoJedinice,
          redoslijed, aktivna: true, ...extras,
        },
      },
      { upsert: true, new: true }
    );
  };

  const upsertRM = async (
    naziv: string,
    organizacionaJedinica: mongoose.Types.ObjectId,
    data: Record<string, unknown>
  ) => {
    return RadnoMjesto.findOneAndUpdate(
      { naziv, organizacionaJedinica },
      { $set: { naziv, organizacionaJedinica, organ: organId, aktivno: true, ...data } },
      { upsert: true, new: true }
    );
  };

  // ══════════════════════════════════════════════════
  // 3. FDNI ROOT JEDINICA
  // ══════════════════════════════════════════════════
  const fdniJed = await upsertJedinica(
    'Federalna direkcija za namjensku industriju',
    'direkcija', null, 'osnovna', 1,
    { opis: 'Federalna direkcija za namjensku industriju' }
  );
  const fdniJedId = fdniJed._id as mongoose.Types.ObjectId;

  // RM direktno u Direkciji
  await upsertRM('Direktor Federalne direkcije za namjensku industriju', fdniJedId, {
    kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
    pozicijaKljuc: 'rukovodilac_samostalne_uprave',
    platniRazred: 'II', koeficijent: 6.20, brojIzvrsilaca: 1,
    opsisPoslova: 'Rukovodi Direkcijom, odgovoran za sve poslove iz nadležnosti namjenske industrije.',
  });
  console.log('✓ FDNI root + 1 RM');

  // ══════════════════════════════════════════════════
  // 4. SEKTOR ZA PROIZVODNJU, REMONT I KONTROLU KVALITETA
  // ══════════════════════════════════════════════════
  const sektorPrz = await upsertJedinica(
    'Sektor za proizvodnju, remont i kontrolu kvaliteta proizvoda',
    'sektor', fdniJedId, 'osnovna', 1
  );
  const sektorPrzId = sektorPrz._id as mongoose.Types.ObjectId;

  await upsertRM('Pomoćnik direktora — Sektor za proizvodnju, remont i kontrolu kvaliteta', sektorPrzId, {
    kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
    pozicijaKljuc: 'pomocnik_u_sastavu',
    platniRazred: 'V', koeficijent: 4.85, brojIzvrsilaca: 1,
    opsisPoslova: 'Rukovodi Sektorom, koordinira planiranje i nadzor proizvodnje i remonta NVO.',
  });

  // Grupa za proizvodnju i remont
  const grupaPrz = await upsertJedinica(
    'Grupa za proizvodnju i remont', 'grupa', sektorPrzId, 'unutrasnja', 1
  );
  const grupaPrzId = grupaPrz._id as mongoose.Types.ObjectId;

  await upsertRM('Šef Grupe za proizvodnju i remont', grupaPrzId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za planiranje proizvodnje NVO', grupaPrzId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za remont NVO', grupaPrzId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za proizvodnju i remont', grupaPrzId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });

  // Grupa za razvoj i kontrolu kvaliteta
  const grupaRaz = await upsertJedinica(
    'Grupa za razvoj i kontrolu kvaliteta', 'grupa', sektorPrzId, 'unutrasnja', 2
  );
  const grupaRazId = grupaRaz._id as mongoose.Types.ObjectId;

  await upsertRM('Šef Grupe za razvoj i kontrolu kvaliteta proizvoda', grupaRazId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za razvoj i kvalitet NVO', grupaRazId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za razvoj i kontrolu kvaliteta', grupaRazId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent za administrativne poslove - FDNI', grupaRazId, {
    kategorijaZaposlenog: 'namjestenik',
    pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });
  console.log('✓ Sektor za proizvodnju + 2 grupe');

  // ══════════════════════════════════════════════════
  // 5. SEKTOR ZA PRAVNE I EKONOMSKE POSLOVE
  // ══════════════════════════════════════════════════
  const sektorPrav = await upsertJedinica(
    'Sektor za pravne i ekonomske poslove', 'sektor', fdniJedId, 'osnovna', 2
  );
  const sektorPravId = sektorPrav._id as mongoose.Types.ObjectId;

  await upsertRM('Pomoćnik direktora — Sektor za pravne i ekonomske poslove', sektorPravId, {
    kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
    pozicijaKljuc: 'pomocnik_u_sastavu',
    platniRazred: 'V', koeficijent: 4.85, brojIzvrsilaca: 1,
    opsisPoslova: 'Rukovodi Sektorom, koordinira pravne i ekonomske poslove Direkcije.',
  });

  // Grupa za pravne poslove
  const grupaPrav = await upsertJedinica(
    'Grupa za pravne poslove', 'grupa', sektorPravId, 'unutrasnja', 1
  );
  const grupaPravId = grupaPrav._id as mongoose.Types.ObjectId;

  await upsertRM('Šef Grupe za pravne poslove', grupaPravId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za pravne poslove - FDNI', grupaPravId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za pravne poslove - FDNI', grupaPravId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za pravne poslove - FDNI', grupaPravId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });

  // Grupa za ekonomske poslove
  const grupaEkon = await upsertJedinica(
    'Grupa za ekonomske poslove', 'grupa', sektorPravId, 'unutrasnja', 2
  );
  const grupaEkonId = grupaEkon._id as mongoose.Types.ObjectId;

  await upsertRM('Šef Grupe za ekonomske poslove', grupaEkonId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za ekonomske poslove - FDNI', grupaEkonId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za ekonomske poslove - FDNI', grupaEkonId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent za ekonomsko-finansijske poslove - FDNI', grupaEkonId, {
    kategorijaZaposlenog: 'namjestenik',
    pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });
  console.log('✓ Sektor za pravne i ekonomske poslove + 2 grupe');

  // ══════════════════════════════════════════════════
  // 6. SEKTOR ZA PROMET, MARKETING I SIGURNOST
  // ══════════════════════════════════════════════════
  const sektorPromet = await upsertJedinica(
    'Sektor za promet, marketing i sigurnost', 'sektor', fdniJedId, 'osnovna', 3
  );
  const sektorPrometId = sektorPromet._id as mongoose.Types.ObjectId;

  await upsertRM('Pomoćnik direktora — Sektor za promet, marketing i sigurnost', sektorPrometId, {
    kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
    pozicijaKljuc: 'pomocnik_u_sastavu',
    platniRazred: 'V', koeficijent: 4.85, brojIzvrsilaca: 1,
    opsisPoslova: 'Rukovodi Sektorom, koordinira marketing, promet i sigurnost.',
  });

  // Grupa za promet i marketing
  const grupaPromet = await upsertJedinica(
    'Grupa za promet i marketing', 'grupa', sektorPrometId, 'unutrasnja', 1
  );
  const grupaPrometId = grupaPromet._id as mongoose.Types.ObjectId;

  await upsertRM('Šef Grupe za promet i marketing', grupaPrometId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za promet i marketing', grupaPrometId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za promet i marketing', grupaPrometId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent za promet - FDNI', grupaPrometId, {
    kategorijaZaposlenog: 'namjestenik',
    pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });

  // Grupa za sigurnost
  const grupaSig = await upsertJedinica(
    'Grupa za sigurnost', 'grupa', sektorPrometId, 'unutrasnja', 2
  );
  const grupaSigId = grupaSig._id as mongoose.Types.ObjectId;

  await upsertRM('Šef Grupe za sigurnost', grupaSigId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za sigurnost NVO', grupaSigId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za sigurnost', grupaSigId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  console.log('✓ Sektor za promet + 2 grupe');

  // ══════════════════════════════════════════════════
  // ZAVRŠETAK
  // ══════════════════════════════════════════════════
  const ukupnoJedinica = await OrganizacionaJedinica.countDocuments({ organ: organId });
  const ukupnoRM = await RadnoMjesto.countDocuments({ organ: organId });

  console.log(`\n✅ seed-fdni završen!`);
  console.log(`   Organ: ${fdni.naziv}`);
  console.log(`   Org. jedinica: ${ukupnoJedinica}`);
  console.log(`   Radnih mjesta: ${ukupnoRM}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
