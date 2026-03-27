import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { ReferentniPodaci } from '@nx-fmeri/api-ref';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  await ReferentniPodaci.deleteMany({});
  console.log('Obrisani postojeći referentni podaci');

  const dataDir = path.join(__dirname, 'data');
  const fajlovi = [
    'platni-razredi-sluzbenik.json',
    'platni-razredi-namjestenik.json',
  ];

  for (const fajl of fajlovi) {
    const putanja = path.join(dataDir, fajl);
    if (!fs.existsSync(putanja)) {
      console.warn(`⚠️  Fajl nije pronađen: ${fajl}`);
      continue;
    }
    const podaci = JSON.parse(fs.readFileSync(putanja, 'utf-8'));
    await ReferentniPodaci.create(podaci);
    console.log(`✓ Učitan: ${fajl} (kategorija: ${podaci.kategorija})`);
  }

  console.log('\n✅ Seed referentnih podataka završen!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška pri seed-u:', err);
  process.exit(1);
});
