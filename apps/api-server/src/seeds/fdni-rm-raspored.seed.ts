import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { OrganizacionaJedinica, RadnoMjesto } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  // Dohvati FDNI jedinice
  const j = async (naziv: string) => {
    const jedinica = await OrganizacionaJedinica.findOne({
      naziv: { $regex: new RegExp(naziv, 'i') }
    }).lean();
    if (!jedinica) throw new Error(`Jedinica nije pronađena: ${naziv}`);
    return jedinica._id;
  };

  const fdniId        = await j('Federalna direkcija za namjensku industriju');
  const sektorProzId  = await j('Sektor za proizvodnju, remont i kontrolu kvaliteta');
  const grupaProzId   = await j('Grupa za proizvodnju i remont');
  const grupaRazvojId = await j('Grupa za razvoj i kontrolu kvaliteta');
  const sektorPravId  = await j('Sektor za pravne i ekonomske poslove');
  const grupaPravId   = await j('Grupa za pravne poslove');
  const grupaEkonId   = await j('Grupa za ekonomske poslove');
  const sektorPrometId = await j('Sektor za promet, marketing i sigurnost');
  const grupaPrometId  = await j('Grupa za promet i marketing');
  const grupaSigId     = await j('Grupa za sigurnost');

  // Mapiranje naziv → org. jedinica
  const mapa: { naziv: RegExp; jedinica: mongoose.Types.ObjectId }[] = [
    // Direktor — ostaje na Direkciji
    { naziv: /Direktor Federalne direkcije/i,         jedinica: fdniId },

    // Sektor za proizvodnju
    { naziv: /Pomocnik direktora.*proizvodnj/i,       jedinica: sektorProzId },
    { naziv: /Sef Grupe za proizvodnj/i,              jedinica: grupaProzId },
    { naziv: /planiranje proizvodnje NVO/i,           jedinica: grupaProzId },
    { naziv: /remont NVO/i,                           jedinica: grupaProzId },
    { naziv: /Strucni saradnik za proizvodnj/i,       jedinica: grupaProzId },
    { naziv: /Sef Grupe za razvoj i kontrolu/i,       jedinica: grupaRazvojId },
    { naziv: /razvoj i kvalitet NVO/i,                jedinica: grupaRazvojId },
    { naziv: /razvoj i kontrolu kvaliteta/i,          jedinica: grupaRazvojId },
    { naziv: /administrativne poslove - FDNI/i,       jedinica: sektorProzId },

    // Sektor za pravne i ekonomske poslove
    { naziv: /Pomocnik direktora.*pravne i ekonomske/i, jedinica: sektorPravId },
    { naziv: /Sef Grupe za pravne poslove/i,          jedinica: grupaPravId },
    { naziv: /pravne poslove - FDNI/i,                jedinica: grupaPravId },
    { naziv: /Visi strucni saradnik za pravne.*FDNI/i, jedinica: grupaPravId },
    { naziv: /Sef Grupe za ekonomske/i,               jedinica: grupaEkonId },
    { naziv: /ekonomske poslove - FDNI/i,             jedinica: grupaEkonId },
    { naziv: /ekonomsko-finansijske poslove - FDNI/i, jedinica: grupaEkonId },

    // Sektor za promet, marketing i sigurnost
    { naziv: /Pomocnik direktora.*promet.*marketing/i, jedinica: sektorPrometId },
    { naziv: /Sef Grupe za promet i marketing/i,      jedinica: grupaPrometId },
    { naziv: /promet i marketing/i,                   jedinica: grupaPrometId },
    { naziv: /promet - FDNI/i,                        jedinica: grupaPrometId },
    { naziv: /Sef Grupe za sigurnost/i,               jedinica: grupaSigId },
    { naziv: /sigurnost NVO/i,                        jedinica: grupaSigId },
    { naziv: /Visi strucni saradnik za sigurnost/i,   jedinica: grupaSigId },
  ];

  let azurirano = 0;
  for (const { naziv, jedinica } of mapa) {
    const result = await RadnoMjesto.updateMany(
      { naziv: { $regex: naziv } },
      { organizacionaJedinica: jedinica }
    );
    if (result.modifiedCount > 0) {
      console.log(`  ✓ ${naziv} → ${result.modifiedCount} RM ažurirano`);
      azurirano += result.modifiedCount;
    }
  }

  console.log(`\n✅ Završeno! Ukupno ažurirano: ${azurirano} radnih mjesta`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
