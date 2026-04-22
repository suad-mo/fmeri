import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import * as fs from 'fs';
import { Organ } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  // Učitaj JSON
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data/organs.json'), 'utf-8'),
  );

  await Organ.deleteMany({});
  console.log('Obrisani postojeći organi');

  for (const item of data) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, createdAt, updatedAt, nadredjeniOrgan, ...rest } = item;

    await Organ.create({
      // _id: new mongoose.Types.ObjectId(_id.$oid),
      _id: new mongoose.Types.ObjectId(item._id), // ← direktno, bez .$oid
      ...rest,
      nadredjeniOrgan: nadredjeniOrgan
        ? new mongoose.Types.ObjectId(nadredjeniOrgan)
        : null,
    });
    console.log(`✓ ${rest.naziv}`);
  }

  console.log(`\n✅ Organi seeded: ${data.length}`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
