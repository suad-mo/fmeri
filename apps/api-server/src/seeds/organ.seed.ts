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
    nadleznost: 'Mjeriteljstvo, verifikacija mjerila i kontrola plemenitih metala',
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
    nadleznost: 'Planiranje, koordinacija, proizvodnja, remont i promet naoružanja i vojne opreme',
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

  // ── Poveži OrganizacionaJedinica s Organom ────────────
  console.log('\nPovezujem org. jedinice s organima...');

  // Ministarstvo — sve jedinice osim Zavoda i FDNI
  const miniJedinice = await OrganizacionaJedinica.find({
    tip: { $in: ['ministarstvo', 'kabinet', 'sektor', 'odsjek', 'grupa'] },
  }).lean();

  for (const j of miniJedinice) {
    const nivo = ['ministarstvo', 'kabinet', 'sektor'].includes(j.tip)
      ? 'osnovna'
      : 'unutrasnja';
    await OrganizacionaJedinica.updateOne(
      { _id: j._id },
      { organ: ministarstvo._id, nivoJedinice: nivo }
    );
  }
  console.log(`✓ ${miniJedinice.length} jedinica ministarstva povezano`);

  // Zavod — centri
  const zavodJedinice = await OrganizacionaJedinica.find({
    tip: { $in: ['zavod', 'centar'] },
  }).lean();

  for (const j of zavodJedinice) {
    const nivo = j.tip === 'zavod' ? 'osnovna' : 'unutrasnja';
    await OrganizacionaJedinica.updateOne(
      { _id: j._id },
      { organ: zavod._id, nivoJedinice: nivo }
    );
  }
  console.log(`✓ ${zavodJedinice.length} jedinica Zavoda povezano`);

  // FDNI — sektori i grupe
  const fdniJedinice = await OrganizacionaJedinica.find({
    tip: { $in: ['direkcija', 'grupa'] },
  }).lean();

  // Grupe su UOJ, sektori/direkcija su OOJ
  const fdniSektori = await OrganizacionaJedinica.find({
    naziv: { $regex: /Sektor za|Federalna direkcija/i },
  }).lean();

  for (const j of fdniJedinice) {
    const nivo = j.tip === 'direkcija' ? 'osnovna' :
                 fdniSektori.some(s => s._id.toString() === j._id.toString()) ? 'osnovna' : 'unutrasnja';
    await OrganizacionaJedinica.updateOne(
      { _id: j._id },
      { organ: fdni._id, nivoJedinice: nivo }
    );
  }
  console.log(`✓ ${fdniJedinice.length} jedinica FDNI povezano`);

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
