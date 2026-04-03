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
  // 1. DOHVATI POSTOJEĆI ORGAN — ne kreira novi
  // ══════════════════════════════════════════════════
  const ministarstvo = await Organ.findOne({ skraceniNaziv: 'FMERI' });
  if (!ministarstvo) {
    throw new Error('FMERI organ nije pronađen! Pokreni seed-organ prvo.');
  }
  const organId = ministarstvo._id as mongoose.Types.ObjectId;
  console.log(`✓ Organ: ${ministarstvo.naziv} [${organId}]`);

  // Ukloni eventualne zavod/direkcija jedinice koje ne pripadaju FMERI
  await OrganizacionaJedinica.deleteMany({
    organ: organId,
    tip: { $in: ['zavod', 'direkcija'] },
  });

  // ══════════════════════════════════════════════════
  // 2. HELPER — upsert org. jedinice
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
          redoslijed, aktivna: true,
          uSastavu: false, ...extras,
        },
      },
      { upsert: true, new: true }
    );
  };

  // ══════════════════════════════════════════════════
  // 3. HELPER — upsert radno mjesto
  // ══════════════════════════════════════════════════
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
  // 4. MINISTARSTVO ROOT JEDINICA
  // ══════════════════════════════════════════════════
  const miniJed = await upsertJedinica(
    'Federalno ministarstvo energije, rudarstva i industrije',
    'ministarstvo', null, 'osnovna', 1,
    { opis: 'Federalno ministarstvo energije, rudarstva i industrije' }
  );
  const miniJedId = miniJed._id as mongoose.Types.ObjectId;

  // RM direktno u ministarstvu
  await upsertRM('Federalni ministar energije, rudarstva i industrije', miniJedId, {
    kategorijaZaposlenog: 'izabrani_duznosnik', pozicijaKljuc: 'ministar',
    platniRazred: 'I', koeficijent: 9.00, brojIzvrsilaca: 1,
    opsisPoslova: 'Rukovodi Ministarstvom, odgovoran Vladi Federacije BiH.',
  });
  await upsertRM('Sekretar Ministarstva', miniJedId, {
    kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik', pozicijaKljuc: 'sekretar_organa',
    platniRazred: 'II', koeficijent: 6.20, brojIzvrsilaca: 1,
    opsisPoslova: 'Koordinira radom sektora i organizacionih jedinica Ministarstva.',
  });
  await upsertRM('Savjetnik ministra za energiju', miniJedId, {
    kategorijaZaposlenog: 'izabrani_duznosnik', pozicijaKljuc: 'savjetnik_ministra',
    platniRazred: 'XI', koeficijent: 6.40, brojIzvrsilaca: 1,
  });
  await upsertRM('Savjetnik ministra za rudarstvo', miniJedId, {
    kategorijaZaposlenog: 'izabrani_duznosnik', pozicijaKljuc: 'savjetnik_ministra',
    platniRazred: 'XI', koeficijent: 6.40, brojIzvrsilaca: 1,
  });
  await upsertRM('Savjetnik ministra za industriju', miniJedId, {
    kategorijaZaposlenog: 'izabrani_duznosnik', pozicijaKljuc: 'savjetnik_ministra',
    platniRazred: 'XI', koeficijent: 6.40, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik — interni revizor', miniJedId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
    opsisPoslova: 'Vrši poslove interne revizije prema međunarodnim standardima.',
  });
  console.log('✓ Ministarstvo root + 6 RM');

  // ══════════════════════════════════════════════════
  // 5. KABINET MINISTRA
  // ══════════════════════════════════════════════════
  const kabinet = await upsertJedinica('Kabinet ministra', 'kabinet', miniJedId, 'osnovna', 1);
  const kabinetId = kabinet._id as mongoose.Types.ObjectId;

  await upsertRM('Šef Kabineta', kabinetId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'rukovodilac_osnovne_jedinice',
    platniRazred: 'VI', koeficijent: 4.60, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za razvoj informacionog sistema', kabinetId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za komunikaciju', kabinetId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik - prevodilac', kabinetId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent - tehnički sekretar', kabinetId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 2,
  });
  await upsertRM('Viši referent za tehničku dokumentaciju', kabinetId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });
  await upsertRM('Vozač', kabinetId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'pomocni_radnik',
    platniRazred: 'VII', koeficijent: 1.85, brojIzvrsilaca: 2,
  });
  console.log('✓ Kabinet ministra + 7 RM');

  // ══════════════════════════════════════════════════
  // 6. SEKTOR ENERGIJE
  // ══════════════════════════════════════════════════
  const sektorEn = await upsertJedinica('Sektor energije', 'sektor', miniJedId, 'osnovna', 2);
  const sektorEnId = sektorEn._id as mongoose.Types.ObjectId;

  await upsertRM('Pomoćnik ministra — Sektor energije', sektorEnId, {
    kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik', pozicijaKljuc: 'pomocnik_rukovodioca',
    platniRazred: 'III', koeficijent: 5.70, brojIzvrsilaca: 1,
  });

  // Odsjek za elektroenergetiku
  const odsjekEl = await upsertJedinica('Odsjek za elektroenergetiku', 'odsjek', sektorEnId, 'unutrasnja', 1);
  const odsjekElId = odsjekEl._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za elektroenergetiku', odsjekElId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za elektroenergetiku', odsjekElId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za pravne poslove - elektroenergetika', odsjekElId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za elektroenergetiku', odsjekElId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za elektroenergetiku', odsjekElId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });

  // Odsjek za tečne energente
  const odsjekTe = await upsertJedinica(
    'Odsjek za tečne energente, plin i termoenergetiku', 'odsjek', sektorEnId, 'unutrasnja', 2
  );
  const odsjekTeId = odsjekTe._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za tečne energente, plin i termoenergetiku', odsjekTeId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za tečne energente, plin i termoenergetiku', odsjekTeId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za tečne energente, plin i termoenergetiku', odsjekTeId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za tečne energente, plin i termoenergetiku', odsjekTeId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent za tehničku dokumentaciju - energija', odsjekTeId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });

  // Odsjek za razvoj
  const odsjekRazEn = await upsertJedinica('Odsjek za razvoj', 'odsjek', sektorEnId, 'unutrasnja', 3);
  const odsjekRazEnId = odsjekRazEn._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za razvoj', odsjekRazEnId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za energetske objekte', odsjekRazEnId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za energetski bilans i pokazatelje', odsjekRazEnId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za energetski bilans i pokazatelje', odsjekRazEnId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent za vođenje tehničke dokumentacije - razvoj', odsjekRazEnId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });
  console.log('✓ Sektor energije + 3 odsjeka');

  // ══════════════════════════════════════════════════
  // 7. SEKTOR RUDARSTVA
  // ══════════════════════════════════════════════════
  const sektorRud = await upsertJedinica('Sektor rudarstva', 'sektor', miniJedId, 'osnovna', 3);
  const sektorRudId = sektorRud._id as mongoose.Types.ObjectId;
  await upsertRM('Pomoćnik ministra — Sektor rudarstva', sektorRudId, {
    kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik', pozicijaKljuc: 'pomocnik_rukovodioca',
    platniRazred: 'III', koeficijent: 5.70, brojIzvrsilaca: 1,
  });

  const odsjekRud = await upsertJedinica('Odsjek za rudarstvo', 'odsjek', sektorRudId, 'unutrasnja', 1);
  const odsjekRudId = odsjekRud._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za rudarstvo', odsjekRudId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za podzemnu i površinsku eksploataciju ugljena', odsjekRudId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za metalične mineralne sirovine', odsjekRudId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za prestrukturiranje rudnika uglja', odsjekRudId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za pravne poslove - rudarstvo', odsjekRudId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši samostalni referent za administrativne poslove - rudarstvo', odsjekRudId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'visi_samostalni_referent',
    platniRazred: 'II', koeficijent: 3.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za katastar istražnih prostora i eksploatacionih polja', odsjekRudId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });

  const odsjekGeo = await upsertJedinica('Odsjek za geologiju', 'odsjek', sektorRudId, 'unutrasnja', 2);
  const odsjekGeoId = odsjekGeo._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za geologiju', odsjekGeoId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za osnovna geološka istraživanja', odsjekGeoId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za detaljna geološka istraživanja', odsjekGeoId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za izradu bilansa rezervi mineralnih sirovina', odsjekGeoId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  console.log('✓ Sektor rudarstva + 2 odsjeka');

  // ══════════════════════════════════════════════════
  // 8. SEKTOR INDUSTRIJE
  // ══════════════════════════════════════════════════
  const sektorInd = await upsertJedinica('Sektor industrije', 'sektor', miniJedId, 'osnovna', 4);
  const sektorIndId = sektorInd._id as mongoose.Types.ObjectId;
  await upsertRM('Pomoćnik ministra — Sektor industrije', sektorIndId, {
    kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik', pozicijaKljuc: 'pomocnik_rukovodioca',
    platniRazred: 'III', koeficijent: 5.70, brojIzvrsilaca: 1,
  });

  const odsjekMetal = await upsertJedinica(
    'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
    'odsjek', sektorIndId, 'unutrasnja', 1
  );
  const odsjekMetalId = odsjekMetal._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za metalnu i elektro industriju', odsjekMetalId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za metalnu industriju', odsjekMetalId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 2,
  });
  await upsertRM('Stručni savjetnik za industriju građevinskog materijala i nemetale', odsjekMetalId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za industriju prerade drveta i grafičku djelatnost', odsjekMetalId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za elektroindustriju', odsjekMetalId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });

  const odsjekTekst = await upsertJedinica(
    'Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
    'odsjek', sektorIndId, 'unutrasnja', 2
  );
  const odsjekTekstId = odsjekTekst._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju', odsjekTekstId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za tekstilnu, kožarsku i obućarsku industriju', odsjekTekstId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 2,
  });
  await upsertRM('Stručni savjetnik za farmaceutsku industriju', odsjekTekstId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za hemijsku industriju', odsjekTekstId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });

  const odsjekAnaliza = await upsertJedinica(
    'Odsjek za analizu i praćenje stanja u privredi', 'odsjek', sektorIndId, 'unutrasnja', 3
  );
  const odsjekAnalizaId = odsjekAnaliza._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za analizu i praćenje stanja u privredi', odsjekAnalizaId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za analizu i praćenje stanja u privredi', odsjekAnalizaId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za pravne poslove - industrija', odsjekAnalizaId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent za tehničku dokumentaciju - industrija', odsjekAnalizaId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });

  const odsjekRazInd = await upsertJedinica(
    'Odsjek za razvoj i unapređenje privrede', 'odsjek', sektorIndId, 'unutrasnja', 4
  );
  const odsjekRazIndId = odsjekRazInd._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za razvoj i unapređenje privrede', odsjekRazIndId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za razvoj privrede', odsjekRazIndId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za razvoj privrede', odsjekRazIndId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za unapređenje privrede', odsjekRazIndId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  console.log('✓ Sektor industrije + 4 odsjeka');

  // ══════════════════════════════════════════════════
  // 9. SEKTOR ZA PRAVNE, FINANSIJSKE I OPĆE POSLOVE
  // ══════════════════════════════════════════════════
  const sektorPrav = await upsertJedinica(
    'Sektor za pravne, finansijske i opće poslove', 'sektor', miniJedId, 'osnovna', 5
  );
  const sektorPravId = sektorPrav._id as mongoose.Types.ObjectId;
  await upsertRM('Pomoćnik ministra — Sektor za pravne, finansijske i opće poslove', sektorPravId, {
    kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik', pozicijaKljuc: 'pomocnik_rukovodioca',
    platniRazred: 'III', koeficijent: 5.70, brojIzvrsilaca: 1,
  });

  const odsjekPrav = await upsertJedinica(
    'Odsjek za pravne poslove i radne odnose', 'odsjek', sektorPravId, 'unutrasnja', 1
  );
  const odsjekPravId = odsjekPrav._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za pravne poslove i radne odnose', odsjekPravId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za pravne poslove', odsjekPravId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 2,
  });
  await upsertRM('Stručni savjetnik za normativno-pravne poslove', odsjekPravId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 2,
  });
  await upsertRM('Stručni savjetnik za radne odnose', odsjekPravId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 2,
  });
  await upsertRM('Stručni saradnik - lektor', odsjekPravId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši samostalni referent za kadrovske i administrativne poslove', odsjekPravId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'visi_samostalni_referent',
    platniRazred: 'II', koeficijent: 3.10, brojIzvrsilaca: 1,
  });

  const odsjekFin = await upsertJedinica(
    'Odsjek za finansijsko-računovodstvene poslove', 'odsjek', sektorPravId, 'unutrasnja', 2
  );
  const odsjekFinId = odsjekFin._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za finansijsko-računovodstvene poslove', odsjekFinId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za ekonomsko-finansijske poslove', odsjekFinId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za ekonomsko-finansijske poslove', odsjekFinId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 2,
  });
  await upsertRM('Viši referent - blagajnik', odsjekFinId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });

  const odsjekOpce = await upsertJedinica('Odsjek za opće poslove', 'odsjek', sektorPravId, 'unutrasnja', 3);
  const odsjekOpceId = odsjekOpce._id as mongoose.Types.ObjectId;
  await upsertRM('Šef odsjeka za opće poslove', odsjekOpceId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik', pozicijaKljuc: 'sef_unutrasnje_jedinice',
    platniRazred: 'VII', koeficijent: 4.50, brojIzvrsilaca: 1,
  });
  await upsertRM('Samostalni referent za opće poslove', odsjekOpceId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'samostalni_referent',
    platniRazred: 'III', koeficijent: 3.00, brojIzvrsilaca: 1,
  });
  await upsertRM('Kafe kuharica', odsjekOpceId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'pomocni_radnik',
    platniRazred: 'VII', koeficijent: 1.85, brojIzvrsilaca: 1,
  });
  await upsertRM('Spremačica', odsjekOpceId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'pomocni_radnik',
    platniRazred: 'VII', koeficijent: 1.85, brojIzvrsilaca: 2,
  });

  const pisarnica = await upsertJedinica('Pisarnica', 'odsjek', sektorPravId, 'unutrasnja', 4);
  const pisarnicaId = pisarnica._id as mongoose.Types.ObjectId;
  await upsertRM('Šef pisarnice', pisarnicaId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'sef_unutrasnje_jedinice_sss',
    platniRazred: 'IV', koeficijent: 2.80, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent za kancelarijsko poslovanje', pisarnicaId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 2,
  });
  await upsertRM('Viši referent za arhivske poslove', pisarnicaId, {
    kategorijaZaposlenog: 'namjestenik', pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });
  console.log('✓ Sektor za pravne poslove + 4 odsjeka');

  // ══════════════════════════════════════════════════
  // ZAVRŠETAK
  // ══════════════════════════════════════════════════
  const ukupnoJedinica = await OrganizacionaJedinica.countDocuments({ organ: organId });
  const ukupnoRM = await RadnoMjesto.countDocuments({ organ: organId });

  console.log(`\n✅ seed-fmeri završen!`);
  console.log(`   Organ: ${ministarstvo.naziv}`);
  console.log(`   Org. jedinica: ${ukupnoJedinica}`);
  console.log(`   Radnih mjesta: ${ukupnoRM}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
