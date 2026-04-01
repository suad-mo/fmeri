import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { OrganizacionaJedinica } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  // Postavi centre kao osnovna (OOJ)
  const centri = await OrganizacionaJedinica.find({
    tip: 'centar',
  }).lean();

  for (const centar of centri) {
    await OrganizacionaJedinica.updateOne(
      { _id: centar._id },
      { nivoJedinice: 'osnovna' }
    );
    console.log(`✓ ${centar.naziv} → osnovna`);
  }

  console.log(`\n✅ Završeno! ${centri.length} centara ažurirano`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
