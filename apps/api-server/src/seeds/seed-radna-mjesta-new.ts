import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import * as fs from 'fs';
import { RadnoMjesto } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data/radnomjestos.json'), 'utf-8'),
  );

  await RadnoMjesto.deleteMany({});
  console.log('Obrisana postojeća radna mjesta');

  for (const item of data) {
    const {
      _id,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      __v,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updatedAt,
      organizacionaJedinica,
      organ,
      osnovnaJedinica,
      unutrasnjaJedinica,
      ...rest
    } = item;

    await RadnoMjesto.create({
      _id: new mongoose.Types.ObjectId(_id),
      ...rest,
      organizacionaJedinica: organizacionaJedinica
        ? new mongoose.Types.ObjectId(organizacionaJedinica)
        : null,
      organ: organ ? new mongoose.Types.ObjectId(organ) : null,
      osnovnaJedinica: osnovnaJedinica
        ? new mongoose.Types.ObjectId(osnovnaJedinica)
        : null,
      unutrasnjaJedinica: unutrasnjaJedinica
        ? new mongoose.Types.ObjectId(unutrasnjaJedinica)
        : null,
    });
  }

  console.log(`✅ Radna mjesta seeded: ${data.length}`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
