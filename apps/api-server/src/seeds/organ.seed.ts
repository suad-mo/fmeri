import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { Organ, OrganizacionaJedinica } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  await Organ.deleteMany({});
  console.log('Obrisani postojeći organi');

  // ── 1. Ministarstvo ───────────────────────────────────
  const ministarstvo = await Organ.create({
    naziv: 'Federalno ministarstvo energije, rudarstva i industrije',
    skraceniNaziv: 'FMERI',
    vrstaOrgana: 'ministarstvo',
    nadleznost: 'Energetika, rudarstvo, geološka istraživanja i industrija',
    opis: 'Federalno ministarstvo energije, rudarstva i industrije',
    zakonskiOsnov: [
      'Zakon o ministarstvima i drugim organima uprave FBiH',
      'Zakon o organizaciji organa uprave FBiH',
    ],
    uSastavu: false,
    redoslijed: 1,
  });
  console.log('✓ Ministarstvo FMERI kreiran');

  // ── 2. Zavod za mjeriteljstvo ─────────────────────────
  const zavod = await Organ.create({
    naziv: 'Zavod za mjeriteljstvo',
    skraceniNaziv: 'ZM',
    vrstaOrgana: 'upravna_organizacija',
    nadleznost:
      'Mjeriteljstvo, verifikacija mjerila i kontrola plemenitih metala',
    opis: 'Federalni zavod za mjeriteljstvo — upravna organizacija u sastavu FMERI',
    zakonskiOsnov: [
      'Zakon o mjeriteljstvu FBiH',
      'Zakon o organizaciji organa uprave FBiH — Čl. 19',
    ],
    uSastavu: true,
    nadredjeniOrgan: ministarstvo._id,
    redoslijed: 2,
  });
  console.log('✓ Zavod za mjeriteljstvo kreiran');

  // ── 3. Federalna direkcija za namjensku industriju ────
  const fdni = await Organ.create({
    naziv: 'Federalna direkcija za namjensku industriju',
    skraceniNaziv: 'FDNI',
    vrstaOrgana: 'upravna_organizacija',
    nadleznost:
      'Planiranje, koordinacija, proizvodnja, remont i promet naoružanja i vojne opreme',
    opis: 'Federalna direkcija za namjensku industriju — upravna organizacija u sastavu FMERI',
    zakonskiOsnov: [
      'Zakon o organizaciji organa uprave FBiH — Čl. 19',
      'Zakon o kontroli kretanja i prometa oružja',
    ],
    uSastavu: true,
    nadredjeniOrgan: ministarstvo._id,
    redoslijed: 3,
  });
  console.log('✓ Federalna direkcija za namjensku industriju kreirana');

  // ── Generalna funkcija za rekurzivno dohvatanje potomaka ──
  const dohvatiSvePotomke = async (
    parentId: mongoose.Types.ObjectId,
  ): Promise<mongoose.Types.ObjectId[]> => {
    const ids: mongoose.Types.ObjectId[] = [];
    const djeca = await OrganizacionaJedinica.find({
      nadredjenaJedinica: parentId,
    }).lean();
    for (const dijete of djeca) {
      ids.push(dijete._id as mongoose.Types.ObjectId);
      const potomci = await dohvatiSvePotomke(
        dijete._id as mongoose.Types.ObjectId,
      );
      ids.push(...potomci);
    }
    return ids;
  };

  // ── Poveži OrganizacionaJedinica s Organom ────────────
  console.log('\nPovezujem org. jedinice s organima...');

  // Ministarstvo
  const miniJedinica = await OrganizacionaJedinica.findOne({
    tip: 'ministarstvo',
  }).lean();
  if (miniJedinica) {
    const potomci = await dohvatiSvePotomke(
      miniJedinica._id as mongoose.Types.ObjectId,
    );
    const sviIds = [miniJedinica._id, ...potomci];
    for (const id of sviIds) {
      const j = await OrganizacionaJedinica.findById(id).lean();
      if (!j) continue;
      const nivo = ['ministarstvo', 'kabinet', 'sektor'].includes(j.tip)
        ? 'osnovna'
        : 'unutrasnja';
      await OrganizacionaJedinica.updateOne(
        { _id: id },
        { organ: ministarstvo._id, nivoJedinice: nivo },
      );
    }
    console.log(`✓ ${sviIds.length} jedinica ministarstva povezano`);
  }

  // Zavod
  const zavodJedinica = await OrganizacionaJedinica.findOne({
    tip: 'zavod',
  }).lean();
  if (zavodJedinica) {
    const potomci = await dohvatiSvePotomke(
      zavodJedinica._id as mongoose.Types.ObjectId,
    );
    const sviIds = [zavodJedinica._id, ...potomci];
    for (const id of sviIds) {
      const j = await OrganizacionaJedinica.findById(id).lean();
      if (!j) continue;
      const nivo = j.tip === 'zavod' ? 'osnovna' : 'unutrasnja';
      await OrganizacionaJedinica.updateOne(
        { _id: id },
        { organ: zavod._id, nivoJedinice: nivo },
      );
    }
    console.log(`✓ ${sviIds.length} jedinica Zavoda povezano`);
  }

  // FDNI
  const fdniJedinica = await OrganizacionaJedinica.findOne({
    tip: 'direkcija',
  }).lean();
  if (fdniJedinica) {
    const potomci = await dohvatiSvePotomke(
      fdniJedinica._id as mongoose.Types.ObjectId,
    );
    const sviIds = [fdniJedinica._id, ...potomci];
    for (const id of sviIds) {
      const j = await OrganizacionaJedinica.findById(id).lean();
      if (!j) continue;
      const nivo = ['direkcija', 'sektor'].includes(j.tip)
        ? 'osnovna'
        : 'unutrasnja';
      await OrganizacionaJedinica.updateOne(
        { _id: id },
        { organ: fdni._id, nivoJedinice: nivo },
      );
    }
    console.log(`✓ ${sviIds.length} jedinica FDNI povezano`);
  }

  console.log('\n✅ Seed organa završen!');
  console.log(`   Ministarstvo ID: ${ministarstvo._id}`);
  console.log(`   Zavod ID: ${zavod._id}`);
  console.log(`   FDNI ID: ${fdni._id}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
