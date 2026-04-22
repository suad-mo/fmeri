// apps/api-server/src/seeds/export-dodjela.ts
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import * as fs from 'fs';
import { Zaposlenik } from '@nx-fmeri/api-org';

const exportDodjela = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  const zaposlenici = await Zaposlenik.find({ aktivan: true })
    .populate('organizacionaJedinica', 'naziv')
    .populate('radnoMjesto', 'naziv')
    .populate('user', 'email')
    .lean();

  const export_data = zaposlenici.map((z) => ({
    email: (z.user as any)?.email,
    ime: z.ime,
    prezime: z.prezime,
    organizacionaJedinica: (z.organizacionaJedinica as any)?._id ?? null,
    organizacionaJedinicaNaziv: (z.organizacionaJedinica as any)?.naziv ?? null,
    radnoMjesto: (z.radnoMjesto as any)?._id ?? null,
    radnoMjestoNaziv: (z.radnoMjesto as any)?.naziv ?? null,
  }));

  fs.writeFileSync(
    path.join(__dirname, 'dodjela-export.json'),
    JSON.stringify(export_data, null, 2)
  );

  console.log(`✅ Exportovano ${export_data.length} zaposlenika`);
  console.log('Fajl: apps/api-server/src/seeds/dodjela-export.json');

  await mongoose.disconnect();
  process.exit(0);
};

exportDodjela().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
