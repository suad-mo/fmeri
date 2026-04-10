import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import * as fs from 'fs';
import { Zaposlenik } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data/zaposleniks.json'), 'utf-8'),
  );

  await Zaposlenik.deleteMany({});
  console.log('Obrisani postojeći zaposlenici');

  for (const item of data) {
    const {
      _id,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      __v,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updatedAt,
      organ,
      organizacionaJedinica,
      radnoMjesto,
      user,
      ...rest
    } = item;

    await Zaposlenik.create({
      _id: new mongoose.Types.ObjectId(_id),
      ...rest,
      organ: organ ? new mongoose.Types.ObjectId(organ) : null,
      organizacionaJedinica: organizacionaJedinica
        ? new mongoose.Types.ObjectId(organizacionaJedinica)
        : null,
      radnoMjesto: radnoMjesto
        ? new mongoose.Types.ObjectId(radnoMjesto)
        : null,
      user: user ? new mongoose.Types.ObjectId(user) : null,
    });
  }

  console.log(`✅ Zaposlenici seeded: ${data.length}`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
