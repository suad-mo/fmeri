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
  const zavod = await Organ.findOne({ skraceniNaziv: 'ZM' });
  if (!zavod) {
    throw new Error('Zavod za mjeriteljstvo nije pronađen! Pokreni seed-organ prvo.');
  }
  const organId = zavod._id as mongoose.Types.ObjectId;
  console.log(`✓ Organ: ${zavod.naziv} [${organId}]`);

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
  // 3. ZAVOD ROOT JEDINICA
  // ══════════════════════════════════════════════════
  const zavodJed = await upsertJedinica(
    'Zavod za mjeriteljstvo', 'zavod', null, 'osnovna', 1,
    { opis: 'Federalni zavod za mjeriteljstvo' }
  );
  const zavodJedId = zavodJed._id as mongoose.Types.ObjectId;

  // RM direktno u Zavodu
  await upsertRM('Direktor Zavoda za mjeriteljstvo', zavodJedId, {
    kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
    pozicijaKljuc: 'rukovodilac_samostalne_uprave',
    platniRazred: 'II', koeficijent: 6.20, brojIzvrsilaca: 1,
    opsisPoslova: 'Rukovodi Zavodom, odgovoran za sve poslove iz nadležnosti mjeriteljstva.',
  });
  await upsertRM('Načelnik Službe za opće poslove - Zavod', zavodJedId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'rukovodilac_osnovne_jedinice',
    platniRazred: 'VI', koeficijent: 4.60, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za pravne poslove - Zavod', zavodJedId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za ekonomske poslove - Zavod', zavodJedId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za ekonomske poslove - Zavod', zavodJedId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent za opće poslove - Zavod', zavodJedId, {
    kategorijaZaposlenog: 'namjestenik',
    pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });
  console.log('✓ Zavod root + 6 RM');

  // ══════════════════════════════════════════════════
  // 4. CENTAR ZA MJERITELJSTVO MOSTAR
  // ══════════════════════════════════════════════════
  const centarMostar = await upsertJedinica(
    'Centar za mjeriteljstvo Mostar', 'centar', zavodJedId, 'osnovna', 1
  );
  const centarMostarId = centarMostar._id as mongoose.Types.ObjectId;

  await upsertRM('Načelnik Centra - Mostar', centarMostarId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'rukovodilac_osnovne_jedinice',
    platniRazred: 'VI', koeficijent: 4.60, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za mjeriteljstvo - Mostar', centarMostarId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za plemenite metale - Mostar', centarMostarId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za mjeriteljstvo - Mostar', centarMostarId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za plemenite metale - Mostar', centarMostarId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za mjeriteljstvo - Mostar', centarMostarId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent za mjeriteljstvo i plemenite metale - Mostar', centarMostarId, {
    kategorijaZaposlenog: 'namjestenik',
    pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });
  console.log('✓ Centar Mostar + 7 RM');

  // ══════════════════════════════════════════════════
  // 5. CENTAR ZA MJERITELJSTVO SARAJEVO
  // ══════════════════════════════════════════════════
  const centarSarajevo = await upsertJedinica(
    'Centar za mjeriteljstvo Sarajevo', 'centar', zavodJedId, 'osnovna', 2
  );
  const centarSarajevoId = centarSarajevo._id as mongoose.Types.ObjectId;

  await upsertRM('Načelnik Centra - Sarajevo', centarSarajevoId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'rukovodilac_osnovne_jedinice',
    platniRazred: 'VI', koeficijent: 4.60, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za mjeriteljstvo - Sarajevo', centarSarajevoId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za plemenite metale - Sarajevo', centarSarajevoId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za mjeriteljstvo - Sarajevo', centarSarajevoId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za plemenite metale - Sarajevo', centarSarajevoId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za mjeriteljstvo - Sarajevo', centarSarajevoId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent za mjeriteljstvo i plemenite metale - Sarajevo', centarSarajevoId, {
    kategorijaZaposlenog: 'namjestenik',
    pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });
  console.log('✓ Centar Sarajevo + 7 RM');

  // ══════════════════════════════════════════════════
  // 6. CENTAR ZA MJERITELJSTVO TUZLA
  // ══════════════════════════════════════════════════
  const centarTuzla = await upsertJedinica(
    'Centar za mjeriteljstvo Tuzla', 'centar', zavodJedId, 'osnovna', 3
  );
  const centarTuzlaId = centarTuzla._id as mongoose.Types.ObjectId;

  await upsertRM('Načelnik Centra - Tuzla', centarTuzlaId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'rukovodilac_osnovne_jedinice',
    platniRazred: 'VI', koeficijent: 4.60, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za mjeriteljstvo - Tuzla', centarTuzlaId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni savjetnik za plemenite metale - Tuzla', centarTuzlaId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX', koeficijent: 4.10, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši stručni saradnik za mjeriteljstvo - Tuzla', centarTuzlaId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'visi_strucni_saradnik',
    platniRazred: 'X', koeficijent: 3.90, brojIzvrsilaca: 1,
  });
  await upsertRM('Stručni saradnik za mjeriteljstvo - Tuzla', centarTuzlaId, {
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_saradnik',
    platniRazred: 'XI', koeficijent: 3.70, brojIzvrsilaca: 1,
  });
  await upsertRM('Viši referent za mjeriteljstvo i plemenite metale - Tuzla', centarTuzlaId, {
    kategorijaZaposlenog: 'namjestenik',
    pozicijaKljuc: 'visi_referent',
    platniRazred: 'V', koeficijent: 2.70, brojIzvrsilaca: 1,
  });
  console.log('✓ Centar Tuzla + 6 RM');

  // ══════════════════════════════════════════════════
  // ZAVRŠETAK
  // ══════════════════════════════════════════════════
  const ukupnoJedinica = await OrganizacionaJedinica.countDocuments({ organ: organId });
  const ukupnoRM = await RadnoMjesto.countDocuments({ organ: organId });

  console.log(`\n✅ seed-zavod završen!`);
  console.log(`   Organ: ${zavod.naziv}`);
  console.log(`   Org. jedinica: ${ukupnoJedinica}`);
  console.log(`   Radnih mjesta: ${ukupnoRM}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
